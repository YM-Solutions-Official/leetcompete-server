import { Server } from "socket.io";

let io;

export const setupSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    // Join room event
    socket.on("join-room", ({ roomId, userId, name }) => {
      // Prevent duplicate joins
      if (socket.data.joinedRoom === roomId) {
        console.log(`User ${userId} already in room ${roomId}`);
        return;
      }

      socket.data.joinedRoom = roomId;
      socket.data.userId = userId;
      socket.data.name = name;
      
      socket.join(roomId);
      console.log(`✅ ${name} (${userId}) joined room ${roomId}`);

      // Notify others in the room that opponent has joined
      socket.to(roomId).emit("opponent-joined", { userId, name });
    });

    // Leave room event
    socket.on("leave-room", ({ roomId, userId }) => {
      if (socket.data.joinedRoom === roomId) {
        socket.leave(roomId);
        socket.data.joinedRoom = null;
        console.log(`👋 User ${userId} left room ${roomId}`);
        
        // Notify others in the room that opponent left
        socket.to(roomId).emit("opponent-left", { userId });
      }
    });

    // Cancel room event (host only)
    socket.on("cancel-room", ({ roomId }) => {
      console.log(`❌ Room ${roomId} cancelled by host`);
      
      // Notify all participants that room is cancelled
      socket.to(roomId).emit("room-cancelled");
      
      // Remove all sockets from this room
      io.in(roomId).socketsLeave(roomId);
    });

    // Chat message event
    socket.on("send-message", ({ roomId, sender, name, text }) => {
      if (!roomId || !text) {
        console.log("❌ Invalid message data");
        return;
      }
      
      console.log(`💬 ${name} in ${roomId}: ${text}`);
      
      // Broadcast to everyone in the room including sender
      io.to(roomId).emit("receive-message", { 
        sender, 
        name, 
        text,
        timestamp: new Date().toISOString()
      });
    });

    // Start match event (only host can trigger, but ALL participants receive it)
    socket.on("start-match", ({ roomId }) => {
      console.log(`🎮 Match starting in room ${roomId}`);
      
      // Notify EVERYONE in the room (including the host who triggered it)
      io.to(roomId).emit("match-started");
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      const roomId = socket.data.joinedRoom;
      const userId = socket.data.userId;
      
      if (roomId && userId) {
        console.log(`🔴 User ${userId} disconnected from room ${roomId}`);
        
        // Notify others that opponent disconnected
        socket.to(roomId).emit("opponent-disconnected", { userId });
        
        // Clean up room data
        socket.leave(roomId);
      } else {
        console.log("🔴 User disconnected:", socket.id);
      }
    });

    // Code sync event (for real-time code sharing)
    socket.on("sync-code", ({ roomId, problemId, language, code, userId }) => {
      socket.to(roomId).emit("code-updated", {
        problemId,
        language,
        code,
        userId,
      });
    });

    // Submission event
    socket.on("code-submitted", ({ roomId, userId, problemId, result }) => {
      console.log(`📝 ${userId} submitted code for problem ${problemId}`);
      socket.to(roomId).emit("opponent-submitted", {
        userId,
        problemId,
        result,
      });
    });

    // Problem change event
    socket.on("change-problem", ({ roomId, problemIndex, userId }) => {
      console.log(`🔄 ${userId} changed to problem ${problemIndex} in room ${roomId}`);
      socket.to(roomId).emit("opponent-changed-problem", {
        problemIndex,
        userId,
      });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized. Call setupSocketServer first.");
  }
  return io;
};