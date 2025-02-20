"use client";

import { useState, useEffect } from "react";
import { Input } from "@heroui/react";
import { Button } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import useSession from "@/hooks/useSession";
import { COOKIE_NAME } from "@/constants";
import { socket } from "@/socket";

export default function ChatBox() {
  const {
    data: { user_credentials: userCredentials },
  } = useSession(COOKIE_NAME);
  const [messages, setMessages] = useState([
    { message: "Hello! How can I help you?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [isMinimized, setIsMinimized] = useState(true);

  const sendMessage = () => {
    if (!input.trim()) return;
    const data = {
      room: userCredentials?.roomChat,
      message: input,
      sender: userCredentials?.username,
    };
    // setMessages([
    //   ...messages,
    //   { message: input, sender: userCredentials?.username },
    // ]);
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
    const newValue = !isMinimized;
    setIsMinimized(newValue);

    if (!newValue && userCredentials?.username) {
      console.log("Joining room:", userCredentials?.roomChat);
      // Kiểm tra kết nối
      if (socket.disconnected) {
        socket.connect();
      }
      // Đảm bảo socket đã kết nối trước khi join room
      if (socket.connected) {
        socket.emit("join-room", {
          room: userCredentials?.roomChat,
          username: userCredentials?.username,
        });
      } else {
        console.log("Socket not connected, waiting...");
        socket.on("connect", () => {
          socket.emit("join-room", {
            room: userCredentials?.roomChat,
            username: userCredentials?.username,
          });
        });
      }
    }
  };

  useEffect(() => {
    if (socket.disconnected) {
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("system", (data) => {
      setMessages((prev) => [
        ...prev,
        { sender: "system", message: data.message },
      ]);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("system");
      socket.off("message");
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
          className="bg-[#2d9a4d] text-white p-2 cursor-pointer rounded-t-lg"
        >
          Chat Box
        </div>
        {!isMinimized && (
          <CardBody className="h-full overflow-y-auto flex flex-col space-y-2">
            {messages.map((msg, index) => {
              if (msg.sender === "system") {
                return (
                  <div key={index} className={`text-[10px] p-2 max-w-xs`}>
                    {msg.message}
                  </div>
                );
              }
              return (
                <div
                  key={index}
                  className={`p-2 rounded-lg max-w-xs ${
                    msg.sender !== userCredentials.username
                      ? "bg-gray-200 text-black self-start"
                      : "bg-[#76b172] text-white self-end"
                  }`}
                >
                  <p className="text-sm font-bold">{msg.sender}</p>
                  {msg.message}
                </div>
              );
            })}
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
                onPress={sendMessage}
                className="bg-[#2d9a4d] text-white p-3 rounded-r-lg hover:bg-[#0f4d31] transition"
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
