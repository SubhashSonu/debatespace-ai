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
    // console.log("Socket connected:", socket.id);

    socket.on(
      "video:join",
      async ({ roomId, userId, username, topic, duration }) => {
        try {
          const roomName = `video:${roomId}`;

          // console.log(`${username} joining room ${roomId}`);

          if (!videoRooms[roomName]) {
            videoRooms[roomName] = {
              topic,
              users: [],
              debateStarted: false,
              startTime: null,
              duration,
            };
          }

          const exists = videoRooms[roomName].users.some(
            (u) => u.userId === userId,
          );

          if (videoRooms[roomName].users.length >= 2 && !exists) {
            socket.emit("room:full");

            return;
          }

          socket.join(roomName);

          if (!exists) {
            videoRooms[roomName].users.push({
              socketId: socket.id,
              userId,
              username,
            });

            await addParticipant(roomId, userId, username);
          } else {
            const existingUser = videoRooms[roomName].users.find(
              (u) => u.userId === userId,
            );

            if (existingUser) {
              if (existingUser.socketId !== socket.id) {
                const oldSocket = io.sockets.sockets.get(existingUser.socketId);

                oldSocket?.disconnect(true);
              }

              existingUser.socketId = socket.id;
            }
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

            try {
              await startDebate(roomId);
            } catch (error) {
              console.error("Failed to start debate:", error);

              room.debateStarted = false;
              room.startTime = null;

              return;
            }

            emitRoomUpdate(io, roomName);
          }

          socket.to(roomName).emit("video:user-joined");
        } catch (error) {
          console.error("video:join error", error);
        }
      },
    );

    socket.on("webrtc:offer", ({ roomId, offer }) => {
      // console.log("SERVER RECEIVED OFFER", roomId);
      socket.to(`video:${roomId}`).emit("webrtc:offer", {
        offer,
      });
    });

    socket.on("webrtc:answer", ({ roomId, answer }) => {
      // console.log("SERVER RECEIVED ANSWER", roomId);
      socket.to(`video:${roomId}`).emit("webrtc:answer", {
        answer,
      });
    });

    socket.on("webrtc:ice-candidate", ({ roomId, candidate }) => {
      // console.log("SERVER RECEIVED ICE");
      socket.to(`video:${roomId}`).emit("webrtc:ice-candidate", {
        candidate,
      });
    });

    socket.on("debate:end", ({ roomId, reason }) => {
      try {
        const roomName = `video:${roomId}`;

        if (videoRooms[roomName]) {
          videoRooms[roomName].debateStarted = false;
          videoRooms[roomName].startTime = null;
        }
        io.to(`video:${roomId}`).emit("debate:ended", {
          reason,
        });
      } catch (error) {
        console.error(error);
      }
    });

    socket.on("disconnect", async (reason) => {
      try {
        // console.log("Socket disconnected:", socket.id, reason);
        for (const roomName in videoRooms) {
          const user = videoRooms[roomName]?.users.find(
            (u) => u.socketId === socket.id,
          );

          if (user) {
            videoRooms[roomName].users = videoRooms[roomName].users.filter(
              (u) => u.socketId !== socket.id,
            );

            const room = videoRooms[roomName];

            if (room.users.length === 0) {
              delete videoRooms[roomName];
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
      } catch (error) {
        console.error("disconnect error", error);
      }
    });
  });

  return io;
};

module.exports = initializeSocket;
