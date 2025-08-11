// components/UI.tsx — versión mínima para compilar
import type { ReactNode } from 'react';

export function Dialog(
  { children, onClose }: { children?: ReactNode; onClose?: () => void }
) {
  // Temporalmente desactivado para evitar overlays mientras terminamos ajustes
  return null;
}
