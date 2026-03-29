import Navbar from "@/components/Navbar";
import ChatInterface from "@/components/translate/ChatInterface";

export default function TranslatePage() {
  return (
    <div className="h-screen bg-parchment flex flex-col">
      <Navbar />
      <ChatInterface />
    </div>
  );
}
