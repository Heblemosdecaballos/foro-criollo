// components/SiteFooter.tsx
export default function SiteFooter() {
  return (
    <footer className="mt-10 border-t">
      <div className="mx-auto max-w-6xl p-4 text-sm text-neutral-600">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
          <p>© {new Date().getFullYear()} Hablando de Caballos</p>
          <p className="text-neutral-500">Hecho con Next.js + Supabase</p>
        </div>
      </div>
    </footer>
  );
}
