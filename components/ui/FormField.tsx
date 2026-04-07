import { ReactNode } from 'react'

interface FieldProps {
  label: string
  error?: string
  required?: boolean
  children: ReactNode
  hint?: string
}

export function FormField({ label, error, required, children, hint }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="field-label">
        {label}{required && <span className="text-rose-500 ml-1 font-bold">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[10px] text-slate-500 mt-1 ml-0.5 font-medium">{hint}</p>}
      {error && <p className="text-[10px] text-rose-500 mt-1 ml-0.5 font-bold uppercase tracking-tight">{error}</p>}
    </div>
  )
}
