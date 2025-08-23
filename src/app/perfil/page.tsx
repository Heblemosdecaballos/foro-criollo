// src/app/perfil/page.tsx
import ProfileForm from "@/components/ProfileForm";

// (Si tienes lógica para obtener el perfil, mantenla.
// Debajo dejo un ejemplo mínimo que ilustra la idea.)
type ProfileObj = {
  email: string;
  full_name: string;
  username: string;
  phone: string;
};

async function getProfile(): Promise<ProfileObj | null> {
  // ⬇️ Reemplaza esta función con tu fetch real (Supabase/DB)
  return null; // ejemplo: puede devolver null
}

export default async function PerfilPage() {
  const profile = await getProfile(); // profile puede ser ProfileObj | null

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Mi perfil</h1>

      {/* ⬇️ Cambio CLAVE: si profile es null, lo convertimos a undefined */}
      <ProfileForm profile={profile ?? undefined} />
    </div>
  );
}
