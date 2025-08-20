// app/hall/nueva/page.tsx
import { createHallProfile } from './actions'

export const revalidate = 0

export default function NuevaNominationPage() {
  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Nominar al Hall de la Fama</h1>

      <form action={createHallProfile} className="space-y-4" encType="multipart/form-data">
        <div>
          <label className="block text-sm font-medium">Título</label>
          <input name="title" className="input w-full" required />
        </div>

        <div>
          <label className="block text-sm font-medium">Andar</label>
          <select name="gait" className="input w-full" required>
            <option value="trocha_galope">Trocha y Galope</option>
            <option value="trote_galope">Trote y Galope</option>
            <option value="trocha_colombia">Trocha Colombia</option>
            <option value="paso_fino">Paso Fino Colombiano</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Año (opcional)</label>
          <input name="year" type="number" className="input w-full" placeholder="Ej. 2018" />
        </div>

        <div>
          <label className="block text-sm font-medium">Biografía</label>
          <textarea name="bio" rows={4} className="input w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium">Logros (opcional)</label>
          <textarea name="achievements" rows={3} className="input w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium">Portada (opcional)</label>
          <input type="file" name="cover" accept="image/*" />
        </div>

        <button className="btn btn-primary">Crear nominación</button>
      </form>
    </div>
  )
}
