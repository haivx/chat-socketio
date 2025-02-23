"use client";

import { useState, useRef } from "react";
import useChatSocket from "@/hooks/useChatSocket";
import { Card, CardBody } from "@heroui/react";
import useSession from "@/hooks/useSession";
import { COOKIE_NAME, FileType } from "@/constants";
import { socket } from "@/socket";
import { isImageFile } from "@/util";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";

export default function ChatBox() {
  const {
    data: { user_credentials: userCredentials },
  } = useSession(COOKIE_NAME);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isMinimized, setIsMinimized] = useState(true);
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

  const { messages, sendMessage, sendFile } = useChatSocket({
    room: userCredentials.roomChat,
    username: userCredentials.username,
  });

  return (
    <div className="fixed bottom-0 right-0 m-4">
      <div className="">
        <Card
          className={`w-72 overflow-visible ${
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
            <>
              <CardBody className="h-full overflow-y-auto flex flex-col space-y-2">
                <ChatMessages
                  messages={messages}
                  currentUser={userCredentials.username}
                />
              </CardBody>
              <ChatInput onSend={sendMessage} onFileUpload={sendFile} />
            </>
          )}
        </Card>
        <input
          type="file"
          className="hidden"
          ref={inputRef}
          onChange={onUpload}
        />
      </div>
    </div>
  );
}
