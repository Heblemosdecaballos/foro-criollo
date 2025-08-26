"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createPostAction } from "./actions";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
    >
      {pending ? "Publicando…" : "Publicar respuesta"}
    </button>
  );
}

export default function NewPostForm({
  threadId,
  isLoggedIn,
}: {
  threadId: string;
  isLoggedIn: boolean;
}) {
  const [state, formAction] = useFormState(createPostAction, {
    ok: null,
    message: null,
  });

  if (!isLoggedIn) {
    return (
      <p className="text-sm text-red-700 bg-red-50 border border-red-200 p-2 rounded">
        Debes iniciar sesión para publicar.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="thread_id" value={threadId} />
      <textarea
        name="content"
        required
        rows={4}
        placeholder="Escribe tu respuesta…"
        className="w-full border rounded p-2"
      />
      {state?.ok === false && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 p-2 rounded">
          {state.message}
        </p>
      )}
      {state?.ok === true && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 p-2 rounded">
          ¡Respuesta publicada!
        </p>
      )}
      <SubmitBtn />
    </form>
  );
}
