import Room from "../model/roomModel.js";
import Match from "../model/matchModel.js";
import { nanoid } from "nanoid";
import { getIO } from "../sockets/socketServer.js";

export const createRoom = async (req, res) => {
  try {
    const { hostId, problems } = req.body;
    
    if (!hostId) {
      return res.status(400).json({ error: "Host ID is required" });
    }

    let roomId;
    let exists = true;
    
    // Generate unique alphanumeric room ID (no spaces or special chars)
    while (exists) {
      roomId = nanoid(8).toUpperCase();
      exists = await Room.exists({ roomId });
    }

    const room = new Room({ 
      roomId, 
      host: hostId, 
      problems,
      status: "waiting" 
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
    const { roomId, opponentId } = req.body;
    
    if (!roomId || !opponentId) {
      return res.status(400).json({ error: "Room ID and opponent ID are required" });
    }

    // Trim and normalize room ID
    const normalizedRoomId = roomId.trim().toUpperCase();

    console.log(`🔍 Looking for room: "${normalizedRoomId}"`);
    
    const room = await Room.findOne({ 
      roomId: normalizedRoomId, 
      opponent: null,
      status: "waiting" 
    }).populate("problems host");

    if (!room) {
      console.log(`❌ Room not found or already full: ${normalizedRoomId}`);
      return res.status(404).json({ error: "Room not found or already full" });
    }

    // Update room with opponent
    room.opponent = opponentId;
    room.status = "active";
    await room.save();

    console.log(`✅ Opponent ${opponentId} joined room ${normalizedRoomId}`);

    // Populate the opponent data before sending response
    await room.populate("opponent");

    res.status(200).json({
      roomId: room.roomId,
      host: room.host,
      opponent: room.opponent,
      problems: room.problems,
      metadata: room.metadata,
    });
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
    const { roomId, player1 } = req.body;

    if (!roomId || !player1) {
      return res.status(400).json({ error: "Room ID and player ID are required" });
    }

    const normalizedRoomId = roomId.trim().toUpperCase();
    
    const room = await Room.findOne({ roomId: normalizedRoomId });
    
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    if (room.host.toString() !== player1) {
      return res.status(403).json({ error: "Only the host can cancel the room" });
    }

    await Room.deleteOne({ roomId: normalizedRoomId });
    
    console.log(`✅ Room ${normalizedRoomId} cancelled by host`);
    res.status(200).json({ message: "Room cancelled successfully" });
  } catch (err) {
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