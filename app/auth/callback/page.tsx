"use client";
import { useEffect } from "react";

export default function AuthCallbackPage() {
  useEffect(() => {
    const current = new URL(window.location.href);
    const qp = new URLSearchParams(current.search);

    // Si vienen tokens en el hash (#access_token / #refresh_token), pásalos a query
    if (window.location.hash) {
      const h = new URLSearchParams(window.location.hash.slice(1));
      const at = h.get("access_token");
      const rt = h.get("refresh_token");
      if (at && rt) {
        qp.set("access_token", at);
        qp.set("refresh_token", rt);
      }
    }

    // Siempre reenviamos a /auth/callback/finish con TODOS los params
    window.location.replace(`/auth/callback/finish?${qp.toString()}`);
  }, []);

  return (
    <main className="page">
      <p>Procesando inicio de sesión…</p>
    </main>
  );
}
