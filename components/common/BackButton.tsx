// components/common/BackButton.tsx
'use client'

import { useRouter } from 'next/navigation'

export default function BackButton({ className = 'btn btn-ghost' }: { className?: string }) {
  const router = useRouter()
  return (
    <button type="button" className={className} onClick={() => router.back()}>
      ← Atrás
    </button>
  )
}
