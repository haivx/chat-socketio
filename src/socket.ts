// src/socket.js
import { io } from "socket.io-client";

// Chỉ định rõ ràng port của Socket.IO server
export const socket = io("http://localhost:4000", {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
