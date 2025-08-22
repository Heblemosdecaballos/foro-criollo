// /src/app/chat/page.tsx
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import ChatClient from "@/components/chat/ChatClient";

export const dynamic = "force-dynamic";

function supaServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n: string) => cookieStore.get(n)?.value } }
  );
}

export default async function ChatPage() {
  const supa = supaServer();

  // Traemos al usuario y, si quieres, su perfil
  const { data: auth } = await supa.auth.getUser();
  const user = auth?.user;

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-4">
        <h1 className="text-2xl font-bold">Chat</h1>
        <p className="text-neutral-600">
          Debes iniciar sesión para chatear.
        </p>
      </div>
    );
  }

  // Nombre para mostrar (ajusta según tu tabla profiles)
  let displayName: string | null = null;
  const { data: prof } = await supa
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  displayName = prof?.full_name ?? user.email ?? "Usuario";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Chat en Vivo</h1>
      <ChatClient userId={user.id} displayName={displayName} room="general" />
    </div>
  );
}
