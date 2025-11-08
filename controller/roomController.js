import Room from "../model/roomModel.js";
import { v4 as uuidv4 } from 'uuid'; // Changed to standard ES module import for v4
import Match from "../model/matchModel.js";
import { getIO } from "../sockets/socketServer.js";
import User from "../model/userModel.js";

export const createRoom = async (req, res) => {
  try {
    const { hostId, problems, duration } = req.body;
    
    if (!hostId) {
      return res.status(400).json({ error: "Host ID is required" });
    }

    let roomId;
    let exists = true;
    
    while (exists) {
      roomId = uuidv4().substring(0, 8).toUpperCase(); 
      exists = await Room.exists({ roomId });
    }

    const room = new Room({ 
      roomId, 
      host: hostId, 
      problems,
      status: "waiting",
      duration: duration
    });
    
    await room.save();
    
    console.log(`✅ Room created: ${roomId} by host ${hostId}`);
    res.status(201).json(room);
  } catch (err) {
    console.error("Error creating room:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const joinRoom = async (req, res) => {
  try {

    // we need roomId and opponentId so that opponent (2nd User)can be added to room
    const { roomId, opponentId } = req.body;
    
    if (!roomId || !opponentId) {
      return res.status(400).json({ error: "Room ID and opponent ID are required" });
    }

    const normalizedRoomId = roomId.trim().toUpperCase();

    // searching if the room exists and is joinable or not 
    console.log(`🔍 Looking for room: "${normalizedRoomId}"`);
    
    const room = await Room.findOne({ 
      roomId: normalizedRoomId, 
      opponent: null,
      status: "waiting" 
    }).populate("problems host");

    // if room is not found or already has opponent then return error
    if (!room) {
      console.log(`❌ Room not found or already full: ${normalizedRoomId}`);
      return res.status(404).json({ error: "Room not found or already full" });
    }

    // Prevent host from joining their own room as opponent
    if(room.host._id.toString() === opponentId){
      return res.status(400).json({ error: "Host cannot join their own room as opponent" });
    }

    const opponentDetails = await User.findById(opponentId);
    if (!opponentDetails) {
      return res.status(404).json({ error: "Opponent user not found" });
    }

    room.opponent = opponentId;
    room.status = "active";
    await room.save();

    await room.populate("opponent");

    console.log(`✅ Opponent ${opponentId} joined room ${normalizedRoomId}`);

    const serverRespons = {
      roomId: room.roomId,
      host: room.host,
      opponent: room.opponent,
      problems: room.problems,
      metadata: room.metadata,
      duration: room.duration,
    }

    console.log('Room data sent to client:', serverRespons);

    res.status(200).json(serverRespons);
  } catch (err) {
    console.error("Error joining room:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getRoom = async (req, res) => {
  try {
    const normalizedRoomId = req.params.roomId.trim().toUpperCase();
    
    const room = await Room.findOne({ roomId: normalizedRoomId }).populate(
      "host opponent problems"
    );

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.status(200).json(room);
  } catch (err) {
    console.error("Error fetching room:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const cancelRoom = async (req, res) => {
  try {
    // Note: 'player1' here is the ID of the person making the request
    const { roomId, player1 } = req.body;

    if (!roomId || !player1) {
      return res.status(400).json({ error: "Room ID and player ID are required" });
    }

    const normalizedRoomId = roomId.trim().toUpperCase();
    
    const room = await Room.findOne({ roomId: normalizedRoomId });
    
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const hostId = room.host.toString();
    // Check if opponent exists before trying to convert to string
    const opponentId = room.opponent ? room.opponent.toString() : null;

    // Bi-directional check: allow cancel if requestor is the host OR the opponent
    if (hostId !== player1 && opponentId !== player1) {
      return res.status(403).json({ error: "Only a player in the room can cancel it" });
    }

    await Room.deleteOne({ roomId: normalizedRoomId });
    
    console.log(`✅ Room ${normalizedRoomId} cancelled by player ${player1}`);
    res.status(200).json({ message: "Room cancelled successfully" });
  } catch (err)
    {
    console.error("Error cancelling room:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const endRoom = async (req, res) => {
  try {
    const { roomId, player1, player2, scorePlayer1, scorePlayer2, winner } = req.body;

    const normalizedRoomId = roomId.trim().toUpperCase();
    
    const room = await Room.findOneAndDelete({ roomId: normalizedRoomId });
    
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const match = await Match.create({
      host: player1,
      challenger: player2,
      problems: room.problems,
      scoreHost: scorePlayer1,
      scoreChallenger: scorePlayer2,
      duration: room.duration || 0,
      winner,
    });

    console.log(`✅ Room ${normalizedRoomId} ended, match recorded`);
    res.status(200).json({ message: "Room ended and match recorded", match });
  } catch (err) {
    console.error("Error ending room:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const startMatch = async (req, res) => {
  try {
    const { roomId } = req.body;

    const normalizedRoomId = roomId.trim().toUpperCase();
    
    const room = await Room.findOne({ roomId: normalizedRoomId });
    
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    room.status = "started";
    await room.save();

    const io = getIO();
    io.to(normalizedRoomId).emit("match-started", { roomId: normalizedRoomId });

    console.log(`✅ Match started in room ${normalizedRoomId}`);
    res.status(200).json({ message: "Match started" });
  } catch (err) {
    console.error("Error starting match:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};