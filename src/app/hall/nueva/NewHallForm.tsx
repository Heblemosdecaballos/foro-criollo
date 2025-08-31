'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { createHorseAction } from './actions';

export default function NewHallForm() {
  const router = useRouter();
  const params = useSearchParams();
  const andarDefault = params.get('andar') || '';

  const [name, setName] = useState('');
  const [andar, setAndar] = useState(andarDefault);
  const [desc, setDesc] = useState('');
  const [ped, setPed] = useState('');
  const [pending, start] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const res = await createHorseAction({
        name,
        andar_slug: andar,
        description: desc,
        pedigree_url: ped,
      });

      if (!res.ok || !res.slug || !res.andar) {
        alert(res.message || 'No se pudo crear');
        return;
      }

      router.push(`/hall/${res.andar}/${res.slug}`);
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium mb-1">Nombre</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      {/* Andar */}
      <div>
        <label className="block text-sm font-medium mb-1">Andar</label>
        <select
          value={andar}
          onChange={e => setAndar(e.target.value)}
          required
          className="w-full rounded-md border px-3 py-2"
        >
          <option value="">Seleccione un andar…</option>
          <option value="trocha-y-galope">Trocha y Galope</option>
          <option value="trote-y-galope">Trote y Galope</option>
          <option value="trocha-colombiana">Trocha Colombiana</option>
          <option value="paso-fino-colombiano">Paso Fino Colombiano</option>
        </select>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
        <textarea
          value={desc}
          onChange={e => setDesc(e.target.value)}
          rows={4}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      {/* Pedigrí */}
      <div>
        <label className="block text-sm font-medium mb-1">URL Pedigrí (PDF o imagen) (opcional)</label>
        <input
          type="url"
          value={ped}
          onChange={e => setPed(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-green-700 text-white px-4 py-2 disabled:opacity-50"
      >
        {pending ? 'Creando…' : 'Crear ejemplar'}
      </button>
    </form>
  );
}
