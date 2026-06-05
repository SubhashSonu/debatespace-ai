const { Server } = require("socket.io");
const {
  addParticipant,
  startDebate,
  endDebateByServer,
} = require("../controllers/debateController");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const videoRooms = {};

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: CLIENT_URL,
      methods: ["GET", "POST"],
    },
  });

  const emitRoomUpdate = (io, roomName) => {
    io.to(roomName).emit("room:update", videoRooms[roomName]);
  };

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on(
      "video:join",
      async ({ roomId, userId, username, topic, duration }) => {
        const roomName = `video:${roomId}`;

        if (!videoRooms[roomName]) {
          videoRooms[roomName] = {
            topic,
            users: [],
            debateStarted: false,
            startTime: null,
            duration,
          };
        }

        socket.join(roomName);

        console.log(
          `${username} with socketId ${socket.id} joined ${roomName}`,
        );

        const exists = videoRooms[roomName].users.some(
          (u) => u.socketId === socket.id,
        );

        if (!exists) {
          videoRooms[roomName].users.push({
            socketId: socket.id,
            username,
          });

          await addParticipant(roomId, userId, username);
        }

        emitRoomUpdate(io, roomName);

        const room = videoRooms[roomName];
        if (topic && (!room.topic || room.topic === "No Topic Selected")) {
          room.topic = topic;
          emitRoomUpdate(io, roomName);
        }

        if (room.users.length === 2 && !room.debateStarted) {
          room.debateStarted = true;
          room.startTime = Date.now();

          await startDebate(roomId);

          emitRoomUpdate(io, roomName);
        }

        socket.to(roomName).emit("video:user-joined");
      },
    );

    socket.on("webrtc:offer", ({ roomId, offer }) => {
      socket.to(`video:${roomId}`).emit("webrtc:offer", {
        offer,
      });
    });

    socket.on("webrtc:answer", ({ roomId, answer }) => {
      socket.to(`video:${roomId}`).emit("webrtc:answer", {
        answer,
      });
    });

    socket.on("webrtc:ice-candidate", ({ roomId, candidate }) => {
      socket.to(`video:${roomId}`).emit("webrtc:ice-candidate", {
        candidate,
      });
    });

    socket.on("debate:end", ({ roomId, reason }) => {
      io.to(`video:${roomId}`).emit("debate:ended", {
        reason,
      });
    });

    socket.on("disconnect", async (reason) => {
      for (const roomName in videoRooms) {
        const user = videoRooms[roomName]?.users.find(
          (u) => u.socketId === socket.id,
        );

        if (user) {
          videoRooms[roomName].users = videoRooms[roomName].users.filter(
            (u) => u.socketId !== socket.id,
          );

          console.log("AFTER REMOVE:", roomName, videoRooms[roomName].users);

          const room = videoRooms[roomName];

          if (room.users.length === 0) {
            delete videoRooms[roomName];

            console.log(`Deleted Empty Room ${roomName}`);
          } else {
            if (room.users.length < 2) {
              room.debateStarted = false;

              room.startTime = null;

              const roomId = roomName.replace("video:", "");

              try {
                await endDebateByServer(roomId, "user_left");
              } catch (error) {
                console.error("Failed to end debate:", error);
              }

              io.to(roomName).emit("debate:ended", {
                reason: "user_left",
              });
            }

            emitRoomUpdate(io, roomName);
          }

          socket.to(roomName).emit("video:user-left");

          break;
        }
      }

      console.log("DISCONNECT:", socket.id);

      console.log(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

module.exports = initializeSocket;
