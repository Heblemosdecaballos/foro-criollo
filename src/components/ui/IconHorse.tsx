// src/components/ui/IconHorse.tsx
import Image from "next/image";

export default function IconHorse({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/brand/horse.png" // <- MISMO símbolo del logo
      alt="Caballo"
      width={size}
      height={size}
      className={className}
      priority={false}
    />
  );
}
