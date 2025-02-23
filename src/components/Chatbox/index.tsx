"use client";

import { useState, useEffect, useRef } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import useChatSocket from "@/hooks/useChatSocket";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
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
  const emojiRef = useRef(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messseRef = useRef<HTMLInputElement | null>(null);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  useClickOutside(emojiRef, () => setShowEmojiPicker(false));

  const addEmoji = (emoji: any) => {
    if (!messseRef.current) return;
    const { selectionStart, selectionEnd } = messseRef.current;
    const newVal =
      input.slice(0, selectionStart || 0) +
      emoji.native +
      input.slice(selectionEnd || 0);
    setInput(newVal);
    setShowEmojiPicker(false);
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

  const { messages, sendMessage, sendFile } = useChatSocket({
    room: userCredentials.roomChat,
    username: userCredentials.username,
  });

  return (
    <div className="fixed bottom-0 right-0 m-4">
      <div className="relative">
        <Card
          className={`w-72 ${
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
        {showEmojiPicker && (
          <div className="absolute bottom-14 mb-2 -left-[50%]" ref={emojiRef}>
            <Picker
              data={data}
              onEmojiSelect={addEmoji}
              theme="light"
              previewPosition="none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
