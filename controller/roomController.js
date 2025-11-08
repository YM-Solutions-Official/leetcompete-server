// Import models
import Room from "../model/roomModel.js";
import Match from "../model/matchModel.js";
import User from "../model/userModel.js"; // We need User to validate IDs

// Import utilities
import { v4 as uuidv4 } from 'uuid';
import { getIO } from "../sockets/socketServer.js";

/**
 * @route   POST /api/rooms/create
 * @desc    Creates a new battle room
 * @access  Private (Assumes user is authenticated)
 *
 * @body    { hostId: string, problems: string[] }
 */
export const createRoom = async (req, res) => {
  try {
    const { hostId, problems } = req.body;

    // --- Validation ---
    if (!hostId) {
      return res.status(400).json({ error: "Host ID is required" });
    }
    if (!problems || problems.length === 0) {
      return res.status(400).json({ error: "At least one problem is required" });
    }

    // Check if the host user actually exists
    const hostExists = await User.findById(hostId);
    if (!hostExists) {
      return res.status(404).json({ error: "Host user not found" });
    }

    // --- Room ID Generation ---
    // Loop to guarantee a unique Room ID, though collisions are very rare
    let roomId;
    let exists = true;
    while (exists) {
      // Generate a short, 8-character, uppercase ID
      roomId = uuidv4().substring(0, 8).toUpperCase();
      exists = await Room.exists({ roomId });
    }

    // --- Create Room ---
    const room = new Room({
      roomId,
      host: hostId,
      problems,
      status: "waiting" // Default status
    });

    await room.save();

    console.log(`✅ Room created: ${roomId} by host ${hostId}`);
    
    // Return the newly created room
    res.status(201).json(room);

  } catch (err) {
    console.error("Error creating room:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @route   POST /api/rooms/join
 * @desc    Allows an opponent to join a 'waiting' room
 * @access  Private (Assumes user is authenticated)
 *
 * @body    { roomId: string, opponentId: string }
 */
export const joinRoom = async (req, res) => {
  try {
    const { roomId, opponentId } = req.body;

    // --- Validation ---
    if (!roomId || !opponentId) {
      return res.status(400).json({ error: "Room ID and opponent ID are required" });
    }
    
    const normalizedRoomId = roomId.trim().toUpperCase();

    // Check if the opponent user actually exists
    const opponentDetails = await User.findById(opponentId);
    if (!opponentDetails) {
      return res.status(404).json({ error: "Opponent user not found" });
    }

    // --- Atomic Operation to Prevent Race Condition ---
    // We use `findOneAndUpdate` to find a room that matches *and* update it in one atomic operation.
    // This prevents a "race condition" where two users might try to join the same room simultaneously.
    //
    // Query criteria:
    // 1. Find the room by ID.
    // 2. Ensure it's still 'waiting'.
    // 3. Ensure an 'opponent' is NOT already set (is null).
    // 4. Ensure the host is NOT the one trying to join (opponentId is not the host).
    const updatedRoom = await Room.findOneAndUpdate(
      {
        roomId: normalizedRoomId,
        status: "waiting",
        opponent: null,
        host: { $ne: opponentId } // $ne = Not Equal (prevents host from joining as opponent)
      },
      {
        // The update to apply:
        $set: {
          opponent: opponentId,
          status: "active" // Room is now active and full
        }
      },
      {
        // Options:
        new: true, // Return the *newly updated* document
        populate: [
            { path: "problems" }, 
            { path: "host", select: "name photoURL" }, // Select only needed host fields
            { path: "opponent", select: "name photoURL" } // Select only needed opponent fields
        ]
      }
    );

    // --- Handle Results ---
    if (!updatedRoom) {
      // If `updatedRoom` is null, it means no room matched the query.
      // It was either: not found, already full, not 'waiting', or the user was the host.
      console.log(`❌ Room not found, already full, or invalid joiner: ${normalizedRoomId}`);
      return res.status(404).json({ error: "Room not found, already full, or you cannot join this room" });
    }

    console.log(`✅ Opponent ${opponentId} joined room ${normalizedRoomId}`);

    // Prepare the response data (already populated)
    const serverResponse = {
      roomId: updatedRoom.roomId,
      host: updatedRoom.host,
      opponent: updatedRoom.opponent,
      problems: updatedRoom.problems,
      metadata: updatedRoom.metadata,
    };

    // Send the full room details to the joining opponent
    res.status(200).json(serverResponse);

    // Note: The socket emission for 'opponent-joined' should be handled
    // by the client who just joined, in their socket 'join-room' event.

  } catch (err) {
    console.error("Error joining room:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @route   GET /api/rooms/:roomId
 * @desc    Fetches details for a specific room
 * @access  Public or Private
 *
 * @param   { roomId: string }
 */
export const getRoom = async (req, res) => {
  try {
    const normalizedRoomId = req.params.roomId.trim().toUpperCase();

    const room = await Room.findOne({ roomId: normalizedRoomId })
      .populate("host", "name photoURL")
      .populate("opponent", "name photoURL")
      .populate("problems");

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.status(200).json(room);
  } catch (err) {
    console.error("Error fetching room:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @route   DELETE /api/rooms/cancel
 * @desc    Cancels a 'waiting' room (Host) or leaves an 'active' room (Host or Opponent)
 * @access  Private (Assumes user is authenticated)
 *
 * @body    { roomId: string, userId: string }
 */
export const cancelRoom = async (req, res) => {
  // This function handles *both* a host cancelling a waiting room
  // AND a player leaving an active room.
  try {
    const { roomId, userId } = req.body; // Changed 'player1' to 'userId' for clarity

    if (!roomId || !userId) {
      return res.status(400).json({ error: "Room ID and User ID are required" });
    }

    const normalizedRoomId = roomId.trim().toUpperCase();

    // We use `findOneAndDelete` to get the room's data *before* it's deleted.
    // This is crucial for knowing who to notify (e.g., the opponent).
    const room = await Room.findOneAndDelete({ 
      roomId: normalizedRoomId,
      // We only allow cancellation if the user is *in* the room
      $or: [{ host: userId }, { opponent: userId }] 
    });

    if (!room) {
      // This means the room doesn't exist OR the user isn't part of it.
      return res.status(404).json({ error: "Room not found or you are not in this room" });
    }

    // Now that the room is deleted from the DB,
    // we can tell the socket server to notify everyone.
    const io = getIO();
    
    // We emit 'room-cancelled' to the entire room ID
    // The client-side logic will handle this, making the other player leave.
    io.to(normalizedRoomId).emit("room-cancelled", {
      roomId: normalizedRoomId,
      message: "The room has been cancelled or left by a player.",
    });

    // Also, force all sockets to leave this socket.io room
    io.socketsLeave(normalizedRoomId);

    console.log(`✅ Room ${normalizedRoomId} cancelled or left by player ${userId}`);
    res.status(200).json({ message: "Room cancelled successfully" });
  } catch (err) {
    console.error("Error cancelling room:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @route   POST /api/rooms/end
 * @desc    Ends an 'active' or 'started' room and records the match
 * @access  Private (Assumes user is authenticated)
 *
 * @body    { roomId: string, winnerId: string, scoreHost: number, scoreOpponent: number }
 */
export const endRoom = async (req, res) => {
  try {
    const { roomId, winnerId, scoreHost, scoreOpponent } = req.body;

    const normalizedRoomId = roomId.trim().toUpperCase();

    // Find and delete the room in one step
    const room = await Room.findOneAndDelete({ roomId: normalizedRoomId });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // --- Security / Validation ---
    // Now that we have the *true* room data from the DB, we can create the match.
    // We DO NOT trust the client to tell us who player1 and player2 were.
    // We use the `room.host` and `room.opponent` from our database.
    if (!room.host || !room.opponent) {
      return res.status(400).json({ error: "Cannot record match for a room without two players" });
    }

    const match = await Match.create({
      host: room.host,
      challenger: room.opponent,
      problems: room.problems,
      scoreHost: scoreHost || 0, // Default to 0 if not provided
      scoreChallenger: scoreOpponent || 0,
      duration: room.duration || 0,
      winner: winnerId, // We trust the client on the *winner* ID
    });

    // Here, you would also update the User models with their new ratings (Elo, etc.)
    // (Elo calculation logic would go here)
    // await User.findByIdAndUpdate(room.host, { ... });
    // await User.findByIdAndUpdate(room.opponent, { ... });

    console.log(`✅ Room ${normalizedRoomId} ended, match recorded: ${match._id}`);
    
    // We can emit a socket event to tell clients the match is over
    // and show them the results page.
    const io = getIO();
    io.to(normalizedRoomId).emit("match-ended", {
      roomId: normalizedRoomId,
      matchId: match._id,
    });
    
    // Force sockets to leave the room
    io.socketsLeave(normalizedRoomId);

    res.status(200).json({ message: "Room ended and match recorded", match });
  } catch (err) {
    console.error("Error ending room:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @route   POST /api/rooms/start
 * @desc    Marks a room as 'started' (only by the host)
 * @access  Private (Assumes user is authenticated)
 *
 * @body    { roomId: string, hostId: string }
 */
export const startMatch = async (req, res) => {
  try {
    const { roomId, hostId } = req.body; // We *need* hostId for security

    if (!roomId || !hostId) {
      return res.status(400).json({ error: "Room ID and Host ID are required" });
    }

    const normalizedRoomId = roomId.trim().toUpperCase();

    // Find the room and *verify* the user is the host
    const room = await Room.findOne({
      roomId: normalizedRoomId,
      host: hostId
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found or you are not the host" });
    }

    // --- Validation ---
    if (room.status !== "active") {
      return res.status(400).json({ error: `Room is not in 'active' state (state is ${room.status})` });
    }
    if (!room.opponent) {
      return res.status(400).json({ error: "Cannot start match without an opponent" });
    }

    // --- Update Status ---
    room.status = "started";
    room.createdAt = new Date(); // Reset createdAt to mark the *start* of the match
    await room.save();

    // --- Emit Socket Event ---
    const io = getIO();
    // Emit to everyone in the room
    io.to(normalizedRoomId).emit("match-started", { 
      roomId: normalizedRoomId,
      startTime: room.createdAt // Send the official server start time
    });

    console.log(`✅ Match started in room ${normalizedRoomId}`);
    res.status(200).json({ message: "Match started", startTime: room.createdAt });
  } catch (err) {
    console.error("Error starting match:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};