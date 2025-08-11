// components/UI.tsx — stubs mínimos para compilar sin overlays
import type { ReactNode } from 'react';

export function Dialog(
  { children, onClose }: { children?: ReactNode; onClose?: () => void }
) {
  // Desactivado temporalmente para evitar capas que bloqueen clics
  return null;
}

export function Badge(
  { category, label, children, className = '' }:
  { category?: string; label?: string; children?: ReactNode; className?: string }
) {
  const text =
    (typeof children === 'string' && children) ||
    label ||
    category ||
    '';
  return (
    <span className={`inline-flex items-center rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-xs text-neutral-700 ${className}`}>
      {text}
    </span>
  );
}

export function AvatarText(
  { name, text, className = '' }:
  { name?: string; text?: string; className?: string }
) {
  const base = (name ?? text ?? '').trim();
  const initials = base
    ? base.split(/\s+/).slice(0, 2).map(s => s[0]?.toUpperCase() ?? '').join('')
    : '??';
  return (
    <div className={`inline-flex size-7 items-center justify-center rounded-full bg-neutral-300 text-[10px] font-medium text-neutral-800 ${className}`}>
      {initials}
    </div>
  );
}
