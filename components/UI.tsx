// components/UI.tsx — reset limpio
import type { ReactNode } from 'react';

export function Dialog(
  { children, onClose }: { children?: ReactNode; onClose?: () => void }
) {
  // Temporalmente desactivado para que no haya overlays mientras terminamos ajustes
  return null;
}
