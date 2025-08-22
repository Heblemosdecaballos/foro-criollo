// app/admin/layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container py-8 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Panel de administración</h1>
        <a href="/" className="text-sm underline">Volver al sitio</a>
      </header>
      {children}
    </div>
  )
}
