// components/UI.tsx — stubs mínimos para compilar
import type { ReactNode } from 'react';

export function Dialog(
  { children, onClose }: { children?: ReactNode; onClose?: () => void }
) {
  // Temporalmente desactivado para evitar overlays mientras afinamos el modal
  return null;
}

export function Badge(
  { children, className = '' }: { children?: ReactNode; className?: string }
) {
  return (
    <span className={`inline-flex items-center rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-xs text-neutral-700 ${className}`}>
      {children}
    </span>
  );
}

export function AvatarText(
  { name = '', className = '' }: { name?: string; className?: string }
) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase() ?? '')
    .join('') || '??';

  return (
    <div className={`inline-flex size-7 items-center justify-center rounded-full bg-neutral-300 text-[10px] font-medium text-neutral-800 ${className}`}>
      {initials}
    </div>
  );
}
