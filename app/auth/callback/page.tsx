"use client";
import { useEffect } from "react";

export default function AuthCallbackPage() {
  useEffect(() => {
    const current = new URL(window.location.href);
    const qp = new URLSearchParams(current.search);

    if (window.location.hash) {
      const h = new URLSearchParams(window.location.hash.slice(1));
      const at = h.get("access_token");
      const rt = h.get("refresh_token");
      const th = h.get("token_hash");
      const type = h.get("type");
      const email = h.get("email");
      if (at && rt) { qp.set("access_token", at); qp.set("refresh_token", rt); }
      if (th) qp.set("token_hash", th);
      if (type) qp.set("type", type);
      if (email) qp.set("email", email);
    }

    window.location.replace(`/auth/callback/finish?${qp.toString()}`);
  }, []);

  return <main className="p-6">Procesando inicio de sesión…</main>;
}
