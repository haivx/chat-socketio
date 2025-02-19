"use client";

import { useState, useEffect } from "react";
import { Input } from "@heroui/react";
import { Button } from "@heroui/react";
import io, { Socket } from "socket.io-client";
import { Card, CardBody } from "@heroui/react";
import useSession from "@/hooks/useSession";
import { COOKIE_NAME } from "@/constants";
import { socket } from "@/socket";

export default function ChatBox() {
  const { data: session } = useSession(COOKIE_NAME);
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState([]);
  const [userName, setUserName] = useState("");
  console.log(session);
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [isMinimized, setIsMinimized] = useState(true); // Thêm state để theo dõi trạng thái thu gọn

  const sendMessage = () => {
    if (!input.trim()) return;
    const data = { room, message: input, sender: userName };
    setMessages([...messages, { text: input, sender: "user" }]);
    socket.emit("message", data);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Ngăn việc xuống dòng
      sendMessage();
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized); // Đổi trạng thái khi click vào header
    if (!isMinimized) {
      // join room
      if (room && userName) {
        socket.emit("join-room", { room, username: session?.username });
      }
    }
  };

  useEffect(() => {
    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });
    socket.on("specific_user_joined", (message) => {
      setMessages((prev) => [...prev, { sender: "system", text: message }]);
    });
    return () => {
      socket.off("specific_user_joined");
    };
  }, []);

  return (
    <div className="fixed bottom-0 right-0 m-4">
      <Card
        className={`w-64 ${
          isMinimized ? "h-12" : "h-96"
        } border border-gray-300 rounded-lg shadow-lg transition-all`}
      >
        <div
          onClick={toggleMinimize}
          className="bg-blue-500 text-white p-2 cursor-pointer rounded-t-lg"
        >
          Chat Box
        </div>
        {!isMinimized && (
          <CardBody className="h-full overflow-y-auto flex flex-col space-y-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg max-w-xs ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white self-end"
                    : "bg-gray-200 text-black self-start"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </CardBody>
        )}
        {!isMinimized && (
          <div className="mt-2">
            <div className="flex items-center bg-white rounded-lg shadow-md">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-grow py-3 px-1 rounded-l-lg border-0 focus:ring-2 focus:ring-blue-500"
              />
              <Button
                onClick={sendMessage}
                className="bg-blue-500 text-white p-3 rounded-r-lg hover:bg-blue-600 transition"
              >
                Send
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
