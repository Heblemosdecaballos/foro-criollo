// src/components/UI.tsx
import { cn } from "@/src/lib/utils";

function getInitials(input?: string) {
  if (!input) return "U";
  const parts = input.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
}

export function AvatarText({
  name,
  text,
  label, // compat: si alguien pasa label, lo usamos
  className,
}: {
  name?: string;
  text?: string;
  label?: string; // compat
  className?: string;
}) {
  const content = name ?? text ?? label ?? "Usuario";
  const initials = getInitials(content);

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-cream-200 text-brown-800",
        "w-10 h-10 text-sm font-semibold select-none",
        className
      )}
      title={content}
      aria-label={content}
    >
      {initials}
    </div>
  );
}
