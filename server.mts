import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handle);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    socket.on("join-room", ({ room, username }) => {
      socket.join(room);
      console.log(`User ${username} joined room ${room}`);
      socket
        .to(room)
        .emit("specific_user_joined", `User ${username} joined room ${room}`);
    });

    socket.on("message", ({ room, message, sender }) => {
      socket.join(room);
      console.log(`Message from ${sender} in room ${room}: ${message}`);
      socket.to(room).emit("message", { sender: "system", message });
    });
  });

  io.on("disconect", (socket) => {
    console.log(`user disconnected: ${socket.id}`);
  });

  httpServer.listen(port, () => {
    console.log(`Server is running on http://${hostname}/${port}`);
  });
});
