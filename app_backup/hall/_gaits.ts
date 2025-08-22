// app/hall/_gaits.ts
export type Gait = 'trocha_galope' | 'trote_galope' | 'trocha_colombia' | 'paso_fino'

export const GAITS: Record<Gait, string> = {
  trocha_galope: 'Trocha y Galope',
  trote_galope: 'Trote y Galope',
  trocha_colombia: 'Trocha Colombia',
  paso_fino: 'Paso Fino Colombiano',
}

export function assertGait(g: string | null | undefined): Gait {
  if (g === 'trocha_galope' || g === 'trote_galope' || g === 'trocha_colombia' || g === 'paso_fino') return g
  return 'trocha_galope'
}
