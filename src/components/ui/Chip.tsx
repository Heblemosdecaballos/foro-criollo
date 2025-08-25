// src/components/ui/Chip.tsx
import { cn } from "@/src/lib/utils";
export default function Chip({
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cn("ui-chip", active ? "ui-chip--active" : "ui-chip--muted", className)}
      {...props}
    />
  );
}
