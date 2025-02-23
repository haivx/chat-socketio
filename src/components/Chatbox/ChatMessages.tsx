import Attachment from "./Attachment";

interface ChatMessagesProps {
  messages: {
    message: string;
    sender: string;
    attachment: any | null;
  }[];
  currentUser: string;
}

export default function ChatMessages({
  messages,
  currentUser,
}: ChatMessagesProps) {
  return (
    <>
      {messages.map((msg, index) => {
        if (msg.attachment) {
          return <Attachment key={index} file={msg.attachment} />;
        }
        if (msg.sender === "system") {
          return (
            <div key={index} className="text-[10px] p-2 max-w-xs">
              {msg.message}
            </div>
          );
        }
        return (
          <div
            key={index}
            className={`p-2 rounded-lg max-w-xs ${
              msg.sender !== currentUser
                ? "bg-gray-200 text-black self-start"
                : "bg-[#76b172] text-white self-end"
            }`}
          >
            <p
              className={`text-sm font-bold ${
                msg.sender === currentUser ? "hidden" : ""
              }`}
            >
              {msg.sender}
            </p>
            <span className="text-sm">{msg.message}</span>
          </div>
        );
      })}
    </>
  );
}
