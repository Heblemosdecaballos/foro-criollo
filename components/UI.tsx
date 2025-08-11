import type { ReactNode } from 'react';

export function Dialog(
  { children, onClose }: { children?: ReactNode; onClose?: () => void }
) {
  return null; // temporal
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
