// app/hall/nueva/page.tsx
import NewHallForm from './NewHallForm'

export const revalidate = 0

export default function NuevaNominationPage() {
  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Nominar al Hall de la Fama</h1>
      <NewHallForm />
    </div>
  )
}
