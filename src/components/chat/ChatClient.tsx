// /src/components/chat/ChatClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Msg = {
  id: number;
  room: string;
  sender_id: string;
  sender_name: string | null;
  body: string;
  created_at: string;
};

export default function ChatClient({
  userId,
  displayName,
  room = "general",
}: {
  userId: string;
  displayName: string | null;
  room?: string;
}) {
  const supabase = useMemo(
    () =>
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: true } }
      ),
    []
  );

  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Cargar últimos 100
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("room", room)
        .order("created_at", { ascending: true })
        .limit(100);

      if (!cancelled && !error && data) setMessages(data as Msg[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [room, supabase]);

  // Realtime: INSERTs en la tabla
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${room}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `room=eq.${room}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Msg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room, supabase]);

  // Autoscroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;

    const { error } = await supabase.from("chat_messages").insert({
      room,
      sender_id: userId,
      sender_name: displayName,
      body,
    });

    if (!error) setText("");
    // Si hay error, podrías mostrar un toast
  }

  return (
    <div className="rounded-xl border bg-white p-3">
      <div className="h-[60vh] overflow-y-auto space-y-2 px-1">
        {messages.map((m) => {
          const mine = m.sender_id === userId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={[
                  "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                  mine ? "bg-[#14110F] text-white" : "bg-[#F8F5EC] text-[#14110F]",
                ].join(" ")}
              >
                {!mine && (
                  <div className="mb-1 text-[11px] font-medium text-[#7A7364]">
                    {m.sender_name ?? "Usuario"}
                  </div>
                )}
                <div>{m.body}</div>
                <div className="mt-1 text-[10px] opacity-60">
                  {new Date(m.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="mt-3 flex gap-2">
        <input
          className="flex-1 rounded-lg border px-3 py-2 text-sm"
          placeholder="Escribe un mensaje…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
        />
        <button
          type="submit"
          className="rounded-lg border border-[#14110F] bg-[#14110F] px-4 py-2 text-sm text-white hover:opacity-90"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
