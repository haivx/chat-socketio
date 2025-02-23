"use client";

import { useState, useEffect, useRef, Key } from "react";
import { Input } from "@heroui/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Card,
  CardBody,
} from "@heroui/react";

import useSession from "@/hooks/useSession";
import { IoIosAdd } from "react-icons/io";
import { COOKIE_NAME, FileType } from "@/constants";
import { socket } from "@/socket";
import Attachment from "./Attachment";
import { isImageFile } from "@/util";

export default function ChatBox() {
  const {
    data: { user_credentials: userCredentials },
  } = useSession(COOKIE_NAME);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [messages, setMessages] = useState([
    { message: "Hello! How can I help you?", sender: "bot", attachment: null },
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

    socket.emit("message", data);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleAction = (key: Key) => {
    if (key === "upload") {
      if (inputRef.current) {
        inputRef.current?.click();
      }
    }
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] as File;
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file as Blob);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const ress = await response.json();

    if (ress.success) {
      const data = {
        room: userCredentials?.roomChat,
        message: "attachtment",
        sender: userCredentials?.username,
        attachment: {
          data: ress.fileUrl,
          name: ress.name,
          type: isImageFile(file) ? FileType.IMG : FileType.OTHER,
        },
      };

      socket.emit("message", data);
    } else {
      alert(ress.error || "Upload failed");
      throw new Error(ress.error || "Upload thất bại");
    }
  };

  const toggleMinimize = () => {
    const newValue = !isMinimized;
    setIsMinimized(newValue);

    if (!newValue && userCredentials?.username) {
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
      console.info("Socket connected:", socket.id);
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
        { sender: "system", message: data.message, attachment: null },
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
              if (msg.attachment) {
                return <Attachment key={index} file={msg.attachment} />;
              }
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
                  <p
                    className={`text-sm font-bold ${
                      msg.sender === userCredentials.username && "hidden"
                    }`}
                  >
                    {msg.sender}
                  </p>
                  <span className="text-sm">{msg.message}</span>
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
                startContent={
                  <Dropdown>
                    <DropdownTrigger>
                      <IoIosAdd className="cursor-pointer" />
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Action event example"
                      onAction={handleAction}
                      color="primary"
                      className="text-black"
                    >
                      <DropdownItem key="upload">
                        Upload Image/file
                      </DropdownItem>
                      <DropdownItem key="position">Share position</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                }
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
      <input
        type="file"
        className="hidden"
        ref={inputRef}
        onChange={onUpload}
      />
    </div>
  );
}
