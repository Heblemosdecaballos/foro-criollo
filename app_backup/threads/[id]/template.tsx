// app/threads/[id]/template.tsx
export default function ThreadDetailTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sin loaders, sin Suspense: passthrough
  return <>{children}</>;
}
