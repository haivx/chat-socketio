import { useState, useEffect } from "react";
import { socket } from "@/socket";
import { FileType } from "@/constants";
import { isImageFile } from "@/util";

export interface Message {
  message: string;
  sender: string;
  attachment: any | null;
}

interface ChatSocketProps {
  room: string;
  username: string;
}

export default function useChatSocket({ room, username }: ChatSocketProps) {
  const [messages, setMessages] = useState<Message[]>([
    { message: "Hello! How can I help you?", sender: "bot", attachment: null },
  ]);

  const joinRoom = () => {
    if (socket.disconnected) {
      socket.connect();
    }
    if (socket.connected) {
      socket.emit("join-room", { room, username });
    } else {
      socket.on("connect", () => {
        socket.emit("join-room", { room, username });
      });
    }
  };

  useEffect(() => {
    joinRoom();

    socket.on("connect", () => console.info("Socket connected:", socket.id));
    socket.on("connect_error", (error) =>
      console.error("Socket connection error:", error)
    );

    socket.on("message", (data: Message) =>
      setMessages((prev) => [...prev, data])
    );

    socket.on("system", (data: { message: string }) =>
      setMessages((prev) => [
        ...prev,
        { sender: "system", message: data.message, attachment: null },
      ])
    );

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("system");
      socket.off("message");
    };
  }, [room, username]);

  const sendMessage = (messageText: string) => {
    if (!messageText.trim()) return;
    const data = { room, message: messageText, sender: username };
    socket.emit("message", data);
  };

  const sendFile = async (file: File) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const ress = await response.json();

    if (ress.success) {
      const data = {
        room,
        message: "attachment",
        sender: username,
        attachment: {
          data: ress.fileUrl,
          name: ress.name,
          type: isImageFile(file) ? FileType.IMG : FileType.OTHER,
        },
      };
      socket.emit("message", data);
    } else {
      alert(ress.error || "Upload failed");
      throw new Error(ress.error || "Upload failed");
    }
  };

  return { messages, sendMessage, sendFile };
}
