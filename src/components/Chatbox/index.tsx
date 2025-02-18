"use client";

import { useState, useEffect } from "react";
import { Input } from "@heroui/react";
import { Button } from "@heroui/react";
import io from "socket.io-client";
import { Card, CardBody } from "@heroui/react";
import useSession from "@/hooks/useSession";

export default function ChatBox() {
  const [socket, setSocket] = useState(null);
  const { data: session } = useSession();
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [isMinimized, setIsMinimized] = useState(true); // Thêm state để theo dõi trạng thái thu gọn

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages([...messages, { text: input, sender: "user" }]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { text: "This is a bot response!", sender: "bot" },
      ]);
    }, 1000);
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
    }
  };

  useEffect(() => {
    // 1. Kết nối socket
    const socketInit = async () => {
      await fetch("/api/socket");
      const socket = io();
      setSocket(socket);

      // Lắng nghe tin nhắn mới
      socket.on("new-message", (message) => {
        setMessages((prev) => [...prev, message]);
      });
    };
    socketInit();

    // 2. Join chat và lấy tin nhắn cũ
    const joinChat = async () => {
      const response = await fetch("/api/chat/join", {
        method: "POST",
        body: JSON.stringify({ userId: session.user.id }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setMessages(data.messages);
    };
    if (session?.user) {
      joinChat();
    }

    return () => {
      socket?.disconnect();
    };
  }, [session]);

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
