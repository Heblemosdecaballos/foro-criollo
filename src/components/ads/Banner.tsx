// /src/components/ads/Banner.tsx
export default function Banner({ slot }: { slot: string }) {
  return (
    <div className="my-6 rounded-xl border border-dashed border-[#CFC8B9] bg-white/60 p-6 text-center text-sm text-[#14110F]/70">
      Espacio publicitario: <strong>{slot}</strong>
    </div>
  );
}
