import { createClient } from "@/src/lib/supabase/server";

async function getThread(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/threads/${id}`, { cache: "no-store" });
  return res.json();
}

export default async function ThreadDetail({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const thread = await getThread(params.id);

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">{thread.title}</h1>
      <p className="opacity-80">{thread.body}</p>

      {!user && (
        <div className="bg-yellow-50 border border-yellow-400 text-yellow-900 p-3 rounded">
          Debes iniciar sesión para publicar. <a href="/(auth)/login" className="underline font-medium">Iniciar sesión</a>
        </div>
      )}

      {user && (
        <form action={`/api/threads/${thread.id}/replies`} method="post" className="space-y-2">
          <textarea name="content" required className="w-full border p-2 rounded" placeholder="Escribe tu respuesta..." />
          <input type="hidden" name="author" value={user.email ?? user.id} />
          <button className="bg-black text-white px-4 py-2 rounded">Responder</button>
        </form>
      )}

      <section>
        <h2 className="font-medium mt-6 mb-2">Respuestas</h2>
        {thread.replies?.length ? (
          <ul className="space-y-2">
            {thread.replies.map((r: any, i: number) => (
              <li key={i} className="border p-2 rounded">
                <div className="text-sm opacity-70">@{r.author}</div>
                <div>{r.content}</div>
              </li>
            ))}
          </ul>
        ) : <p className="opacity-70">Sé el primero en responder.</p>}
      </section>
    </main>
  );
}
