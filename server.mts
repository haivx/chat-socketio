import { createServer } from "node:http";
import { Server } from "socket.io";

const port = 4000; // Sử dụng port khác với Next.js

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Origin của ứng dụng Next.js
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("join-room", ({ room, username }) => {
    socket.join(room);
    console.log(`User ${username} joined room ${room}`);
    socket
      .to(room)
      .emit("system", { message: `${username} joined room ${room}` });
  });

  socket.on("message", ({ room, message, sender, attachment }) => {
    console.log(`Message from ${sender} in room ${room}: ${message}`);
    // Gửi cho tất cả mọi người trong room, bao gồm người gửi
    io.to(room).emit("message", { sender, message, attachment });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

httpServer.listen(port, () => {
  console.log(`Socket.IO server running on http://localhost:${port}`);
});
