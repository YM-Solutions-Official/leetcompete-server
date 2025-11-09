import { Server } from "socket.io";
import Room from "../model/roomModel.js"; // Import Room model for cleanup
import MatchParticipant from "../model/matchParticipantModel.js";
import Submission from "../model/submissionModel.js";

let io;

/**
 * Checks if a room is empty and 'waiting', and if so, deletes it.
 * @param {string} roomId - The ID of the room to check.
 */
const checkAndCleanupRoom = async (roomId) => {
  if (!io || !roomId) return;

  try {
    // Get all socket instances (clients) in the given room
    const socketsInRoom = await io.in(roomId).allSockets();

    // Check if the room is empty
    if (socketsInRoom.size === 0) {
      console.log(
        `[Socket Cleanup] Room ${roomId} is empty. Checking for deletion.`
      );

      // Attempt to delete the room ONLY if it's still in the 'waiting' state
      const deletedRoom = await Room.findOneAndDelete({
        roomId: roomId,
        status: "waiting",
      });

      if (deletedRoom) {
        console.log(
          `✅ [Socket Cleanup] Deleted empty 'waiting' room ${roomId} from DB.`
        );
      } else {
        console.log(
          `[Socket Cleanup] Room ${roomId} was not 'waiting' or not found. No deletion.`
        );
      }
    } else {
      console.log(
        `[Socket Info] Room ${roomId} still has ${socketsInRoom.size} user(s).`
      );
    }
  } catch (error) {
    console.error(
      `❌ [Socket Cleanup] Error cleaning up room ${roomId}:`,
      error
    );
  }
};

export const setupSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        "https://leetcompete-client.vercel.app",
        "http://localhost:5173",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`[Socket Connect] 🟢 User connected: ${socket.id}`);

    // --- Join Room Event ---
    // This is the fix for the photoURL
    socket.on("join-room", ({ roomId, userId, name, photoURL }) => {
      if (!roomId || !userId) {
        console.log(`❌ [Join Room] Invalid data from ${socket.id}`);
        return;
      }

      // Prevent duplicate joins
      if (socket.data.joinedRoom === roomId) {
        console.log(`[Join Room] User ${userId} already in room ${roomId}`);
        return;
      }

      // Store all user data on the socket instance
      socket.data.joinedRoom = roomId;
      socket.data.userId = userId;
      socket.data.name = name;
      socket.data.photoURL = photoURL; // Store photoURL

      socket.join(roomId);
      console.log(`[Join Room] ✅ ${name} (${userId}) joined room ${roomId}`);

      // Notify others in the room that opponent has joined
      // THIS IS THE FIX: Send the photoURL to the host
      socket.to(roomId).emit("opponent-joined", { userId, name, photoURL });
    });

    // --- Leave Room Event ---
    socket.on("leave-room", async ({ roomId, userId }) => {
      if (socket.data.joinedRoom === roomId) {
        socket.leave(roomId);
        const oldRoom = socket.data.joinedRoom;
        socket.data.joinedRoom = null;
        console.log(`[Leave Room] 👋 User ${userId} left room ${roomId}`);

        // Notify others in the room that opponent left
        socket.to(roomId).emit("opponent-left", { userId });

        // Check if the room is now empty and needs cleanup
        await checkAndCleanupRoom(oldRoom);
      }
    });

    // --- Cancel Room Event (from host) ---
    socket.on("cancel-room", ({ roomId }) => {
      console.log(`[Cancel Room] ❌ Room ${roomId} cancelled by host`);

      // Notify all *other* participants that room is cancelled
      socket.to(roomId).emit("room-cancelled");

      io.in(roomId).socketsLeave(roomId);
      // Note: The HTTP controller (cancelRoom) handles the DB deletion.
    });

    // --- Chat Message Event ---
    socket.on("send-message", ({ roomId, sender, name, text }) => {
      if (!roomId || !text) {
        console.log("❌ [Chat] Invalid message data");
        return;
      }

      console.log(`💬 ${name} in ${roomId}: ${text}`);
      io.to(roomId).emit("receive-message", {
        sender,
        name,
        text,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("start-match", ({ roomId, metadata }) => {
      if (!metadata) {
        console.log(
          `❌ Match start failed: Metadata missing for room ${roomId}`
        );
        return;
      }

      console.log(
        `🎮 Match starting in room ${roomId} with duration: ${metadata.duration} mins`
      );

      const startTime = Date.now();
      io.to(roomId).emit("match-started", {
        startTime: startTime,
        metadata: metadata,
      });
    });

    // Handle disconnection
    socket.on("disconnect", async () => {
      const roomId = socket.data.joinedRoom;
      const userId = socket.data.userId;

      if (roomId && userId) {
        console.log(
          `[Socket Disconnect] 🔴 User ${userId} disconnected from room ${roomId}`
        );

        // Notify others that opponent disconnected
        socket.to(roomId).emit("opponent-disconnected", { userId });

        // Clean up socket data
        socket.leave(roomId);
        socket.data = {}; // Clear all socket data

        // Check if the room is now empty and needs cleanup
        await checkAndCleanupRoom(roomId);
      } else {
        console.log(`[Socket Disconnect] 🔴 User disconnected: ${socket.id}`);
      }
    });

    // --- Code Sync & Other Events ---
    socket.on("sync-code", ({ roomId, problemId, language, code, userId }) => {
      socket.to(roomId).emit("code-updated", {
        problemId,
        language,
        code,
        userId,
      });
    });

    socket.on(
      "code-submitted",
      async ({ roomId, userId, problemId, result }) => {
        console.log(
          `[Submission] 📝 ${userId} submitted for problem ${problemId}`
        );

        try {
          // Get the match associated with this room
          const room = await Room.findOne({ roomId: roomId });
          if (!room) {
            console.log(`❌ [Submission] Room ${roomId} not found`);
            return;
          }

          const matchId = room.matchId;

          // Save submission to database
          await Submission.create({
            userId,
            problemId,
            matchId,
            code: result.code || "",
            language: result.language || "cpp",
            status: result.allPassed ? "accepted" : "rejected",
            results: result,
            submittedAt: new Date(),
          });

          // Update MatchParticipant if problem was solved
          if (result.allPassed) {
            await MatchParticipant.updateOne(
              { userId, matchId },
              {
                $push: {
                  "problems.$[elem]": {
                    problemId,
                    status: "solved",
                    attempts: result.attempts || 1,
                    lastSubmissionTime: new Date(),
                    bestScore: 100,
                  },
                },
              },
              { arrayFilters: [{ "elem.problemId": { $ne: problemId } }] }
            );

            // If element doesn't exist, add it
            const participant = await MatchParticipant.findOne({
              userId,
              matchId,
            });
            const problemExists = participant?.problems?.some(
              (p) => p.problemId?.toString() === problemId?.toString()
            );

            if (!problemExists) {
              await MatchParticipant.updateOne(
                { userId, matchId },
                {
                  $push: {
                    problems: {
                      problemId,
                      status: "solved",
                      attempts: result.attempts || 1,
                      lastSubmissionTime: new Date(),
                      bestScore: 100,
                    },
                  },
                }
              );
            }
          }

          console.log(
            `✅ [Submission Saved] Submission saved for user ${userId}`
          );
        } catch (error) {
          console.error(`❌ [Submission Save Error]:`, error);
        }

        // Broadcast to opponent
        socket.to(roomId).emit("opponent-submitted", {
          userId,
          problemId,
          result,
        });
      }
    );

    socket.on(
      "my-submission",
      async ({ roomId, userId, problemId, result }) => {
        console.log(`[My Submission] ✅ ${userId} solved problem ${problemId}`);

        try {
          // Get the match associated with this room
          const room = await Room.findOne({ roomId: roomId });
          if (!room) {
            console.log(`❌ [My Submission] Room ${roomId} not found`);
            return;
          }

          const matchId = room.matchId;

          // Save submission to database
          await Submission.create({
            userId,
            problemId,
            matchId,
            code: result.code || "",
            language: result.language || "cpp",
            status: result.allPassed ? "accepted" : "rejected",
            results: result,
            submittedAt: new Date(),
          });

          // Update MatchParticipant
          if (result.allPassed) {
            const participant = await MatchParticipant.findOne({
              userId,
              matchId,
            });
            const problemExists = participant?.problems?.some(
              (p) => p.problemId?.toString() === problemId?.toString()
            );

            if (!problemExists) {
              await MatchParticipant.updateOne(
                { userId, matchId },
                {
                  $push: {
                    problems: {
                      problemId,
                      status: "solved",
                      attempts: result.attempts || 1,
                      lastSubmissionTime: new Date(),
                      bestScore: 100,
                    },
                  },
                }
              );
            }
          }

          console.log(
            `✅ [My Submission Saved] Submission saved for user ${userId}`
          );
        } catch (error) {
          console.error(`❌ [My Submission Save Error]:`, error);
        }

        // Broadcast to self for progress update
        socket.emit("my-submission", {
          userId,
          problemId,
          result,
        });
      }
    );

    socket.on("change-problem", ({ roomId, problemIndex, userId }) => {
      console.log(
        `[Problem Change] 🔄 ${userId} changed to problem ${problemIndex} in ${roomId}`
      );
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
