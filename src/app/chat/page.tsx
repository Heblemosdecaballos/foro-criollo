// /src/app/chat/page.tsx
import ChatClient from "@/components/chat/ChatClient";

export default function ChatPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Chat</h1>
      <p className="text-[#14110F]/70 text-sm">
        Mensajes en tiempo real usando Supabase Realtime.
      </p>
      <ChatClient />
    </div>
  );
}
