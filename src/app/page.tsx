import Image from "next/image";
import ChatBox from "@/components/Chatbox";
import LoginModal from "@/components/login";
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <LoginModal />
    </div>
  );
}
