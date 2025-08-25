// src/components/ui/Chip.tsx
import Image from "next/image";
import { cn } from "@/src/lib/utils";

export default function Chip({
  active,
  className,
  iconHorse = false,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  iconHorse?: boolean;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition",
        active
          ? "bg-olive-600 text-white border-olive-600"
          : "bg-white text-brown-700 border-brown-700/20 hover:bg-cream-100",
        className
      )}
      {...props}
    >
      {iconHorse ? (
        <Image
          src="/brand/horse.png"   // <- mismo archivo en /public/brand/horse.png
          alt="caballo"
          width={16}
          height={16}
        />
      ) : null}
      <span className="truncate">{children}</span>
    </button>
  );
}
