// app/historias/nueva/page.tsx
import RequireAuth from '@/components/auth/RequireAuth'

export default function NuevaHistoriaPage() {
  return (
    <RequireAuth>
      {/* tu formulario aquí */}
      <div>Nueva historia</div>
    </RequireAuth>
  )
}
