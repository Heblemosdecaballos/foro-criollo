'use client'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export function CatPill({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick?: ()=>void }) {
  return (
    <button onClick={onClick} className={`px-4 py-1.5 rounded-full border text-sm whitespace-nowrap ${active ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white hover:bg-neutral-50'}`}>
      {children}
    </button>
  )
}

export function Badge({ category, label }: { category: string; label: string }) {
  const map: Record<string, string> = {
    aprendizaje: 'bg-sky-100 text-sky-800',
    debate: 'bg-orange-100 text-orange-800',
    negocios: 'bg-amber-100 text-amber-800',
    veterinaria: 'bg-green-100 text-green-800',
    entrenamiento: 'bg-violet-100 text-violet-800',
    noticias: 'bg-neutral-200 text-neutral-800',
  }
  return <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${map[category] || 'bg-neutral-100'}`}><ChevronDown className="w-3 h-3" /> {label}</span>
}

export function Dialog(
  { children, onClose }: { children: React.ReactNode; onClose: () => void }
) {
  return null;
}
    <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.2 }} className="relative max-w-xl mx-auto mt-24 bg-white rounded-2xl p-5 shadow-xl">
        <button type="button" className="absolute top-3 right-3 p-2 rounded-full hover:bg-neutral-100" onClick={onClose}>✕</button>
        {children}
      </motion.div>
    </motion.div>
  );
}
export function AvatarText({ text }: { text: string }) {
  return <div className="w-6 h-6 rounded-full bg-neutral-200 grid place-items-center text-[10px] font-semibold">{text}</div>
}
