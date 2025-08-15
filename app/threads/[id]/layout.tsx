// app/threads/[id]/layout.tsx
// Server layout sin loaders ni Suspense
import React from 'react';

export default function ThreadDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No "use client", no Suspense, no loaders
  return <>{children}</>;
}
