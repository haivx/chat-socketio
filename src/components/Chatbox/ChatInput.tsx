import { useState, useRef, Key } from "react";
import { CiFaceSmile } from "react-icons/ci";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import {
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { IoIosAdd } from "react-icons/io";
import { useClickOutside } from "@/hooks/useClickOutside";

interface ChatInputProps {
  onSend: (message: string) => void;
  onFileUpload: (file: File) => void;
}

export default function ChatInput({ onSend, onFileUpload }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const emojiRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(emojiRef, () => setShowEmojiPicker(false));

  const addEmoji = (emoji: any) => {
    if (!inputRef.current) return;
    const { selectionStart, selectionEnd } = inputRef.current;
    const newVal =
      input.slice(0, selectionStart || 0) +
      emoji.native +
      input.slice(selectionEnd || 0);
    setInput(newVal);
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend(input);
      setInput("");
    }
  };

  const handleAction = (key: Key) => {
    if (key === "upload" && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="mt-2 relative">
      <div className="flex items-center bg-white rounded-lg shadow-md">
        <Input
          ref={inputRef}
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
                <DropdownItem key="upload">Upload Image/file</DropdownItem>
                <DropdownItem key="position">Share position</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          }
          endContent={
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="p-1"
            >
              <CiFaceSmile />
            </button>
          }
          className="flex-grow py-3 px-1 rounded-l-lg border-0 focus:ring-2 focus:ring-blue-500"
        />
        <Button
          onPress={() => {
            onSend(input);
            setInput("");
          }}
          className="bg-[#2d9a4d] text-white p-3 rounded-r-lg hover:bg-[#0f4d31] transition"
        >
          Send
        </Button>
      </div>
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
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
  );
}
