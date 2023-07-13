const express = require("express");
const { Server } = require("socket.io");
const path = require("path");
const ServerApp = express();

ServerApp.use(express.static(path.join(__dirname, "")));

ServerApp.all("/", (req, res) => {
  res.sendFile("./index.html");
});

const server = ServerApp.listen(8383, () => {
  console.log(`express server has ruining on port 8383`);
});

const io = new Server(server, {
  cors: {
    origin: "*",
  },
  forceNew: true,
  transports: ["polling"],
});

io.on("connect", async (socket) => {
  console.log(`new user has been connected ID:${socket.id}`);
  const displayName = socket.handshake.query.desplayName;
  if (displayName && displayName.trim().length > 0) {
    socket.broadcast.emit("new-user:join", {
      connSocketId: socket.id,
      displayName,
      mic: false,
    });
  }

  socket.on("got-iceCandiate", (data) => {
    const { ice, to_connSocketId } = data;
    socket.to(to_connSocketId).emit("got-iceCandiate", {
      ice,
      from_connSocketId: socket.id,
    });
  });
  socket.on("new-user:intial-done", (data) => {
    const { to_connSocketId, mic } = data;
    socket.to(to_connSocketId).emit("you:intial-done", {
      from_connSocketId: socket.id,
      displayName,
      mic,
    });
  });

  socket.on("save-offer:on-yoyr-remote", (data) => {
    const { to_connSocketId, offer } = data;
    socket.to(to_connSocketId).emit("save-offer:on-yoyr-remote", {
      from_connSocketId: socket.id,
      offer,
    });
  });

  socket.on("save-ans:your-remote", (data) => {
    const { to_connSocketId, ans } = data;
    socket.to(to_connSocketId).emit("save-ans:your-remote", {
      from_connSocketId: socket.id,
      ans,
    });
  });

  socket.on("video_changed", (data) => {
    const { to_connSocketId, status } = data;
    socket.to(to_connSocketId).emit("video_changed", {
      from_connSocketId: socket.id,
      status,
    });
  });
  socket.on("mic_update", (data) => {
    const { to_connSocketId, status } = data;
    socket.to(to_connSocketId).emit("mic_update", {
      from_connSocketId: socket.id,
      status,
    });
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user:disconnected", {
      from_connSocketId: socket.id,
    });
  });
});
