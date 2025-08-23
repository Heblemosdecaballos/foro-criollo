// /src/components/chat/ChatClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/utils/supabase/browser";

type Msg = { id: string; content: string; username: string | null; created_at: string };

export default function ChatClient() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = supabaseBrowser();

    async function load() {
      const { data } = await supabase
        .from("chat_messages")
        .select("id, content, username, created_at")
        .order("created_at", { ascending: true })
        .limit(200);
      setMessages(data ?? []);
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    load();

    const ch = supabase
      .channel("chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload: any) => {
          setMessages((prev) => [...prev, payload.new as Msg]);
          endRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  async function send() {
    const msg = text.trim();
    if (!msg) return;
    const supabase = supabaseBrowser();
    await supabase.from("chat_messages").insert({ content: msg });
    setText("");
  }

  return (
    <div className="flex h-[60vh] flex-col rounded-xl border border-[#D7D2C7] bg-white">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((m) => (
          <div key={m.id} className="rounded-lg border border-[#E7E2D6] bg-[#F8F5EC] p-2">
            <div className="text-sm">{m.content}</div>
            <div className="mt-1 text-[11px] text-[#14110F]/60">
              {m.username ?? "Anónimo"} · {new Date(m.created_at).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex items-center gap-2 border-t border-[#E7E2D6] p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje…"
          className="flex-1 rounded-lg border border-[#CFC8B9] bg-[#F8F5EC] px-3 py-2"
        />
        <button onClick={send} className="rounded-lg border border-[#14110F] bg-white px-3 py-2 text-sm">
          Enviar
        </button>
      </div>
    </div>
  );
}
