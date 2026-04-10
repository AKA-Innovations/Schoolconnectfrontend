import { ReactNode } from 'react'

export function SectionTitle({ children, description }: { children: ReactNode; description?: string }) {
  return (
    <div className="mb-6">
      <h3 className="font-bold text-slate-900 text-xs uppercase tracking-[0.2em] leading-none mb-2">{children}</h3>
      {description && <p className="text-slate-400 text-xs font-medium leading-relaxed">{description}</p>}
      <div className="w-10 h-0.5 bg-primary mt-3 rounded-full opacity-60" />
    </div>
  )
}
