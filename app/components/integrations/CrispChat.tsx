// components/integrations/CrispChat.tsx
"use client";

import { useEffect } from "react";

export default function CrispChat() {
  const id = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
  useEffect(() => {
    if (!id) return;
    (window as any).$crisp = [];
    (window as any).CRISP_WEBSITE_ID = id;
    const s = document.createElement("script");
    s.src = "https://client.crisp.chat/l.js";
    s.async = true;
    document.head.appendChild(s);
    return () => { document.head.removeChild(s); };
  }, [id]);
  return null;
}
