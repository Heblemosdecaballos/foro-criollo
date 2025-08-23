// src/components/ProfileForm.tsx
"use client";
import { useState } from "react";

export type ProfileObj = {
  email: string;
  full_name: string;
  username: string;
  phone: string;
};

export default function ProfileForm({
  profile,
}: {
  profile?: ProfileObj | null; // ⬅️ Acepta undefined o null
}) {
  const [form, setForm] = useState({
    email: profile?.email ?? "",
    full_name: profile?.full_name ?? "",
    username: profile?.username ?? "",
    phone: profile?.phone ?? "",
  });

  const onChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
    };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: envía 'form' a tu acción del servidor / API
    // Ej: await updateProfile(form)
    console.log("Guardar perfil:", form);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          className="w-full border rounded px-3 py-2"
          value={form.email}
          onChange={onChange("email")}
          placeholder="tu@correo.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nombre completo</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={form.full_name}
          onChange={onChange("full_name")}
          placeholder="Tu nombre"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Usuario</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={form.username}
          onChange={onChange("username")}
          placeholder="@usuario"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Teléfono</label>
        <input
          type="tel"
          className="w-full border rounded px-3 py-2"
          value={form.phone}
          onChange={onChange("phone")}
          placeholder="+57 ..."
        />
      </div>

      <button
        type="submit"
        className="bg-black text-white rounded px-4 py-2"
      >
        Guardar cambios
      </button>
    </form>
  );
}
