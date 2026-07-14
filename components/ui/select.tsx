'use client';

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "../../lib/utils"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children?: React.ReactNode
  className?: string
}

interface SelectContextType {
  value?: string
  onValueChange?: (value: string) => void
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  selectedLabel?: string
  setSelectedLabel: (label: string) => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

const SelectContext = React.createContext<SelectContextType | null>(null)

export const Select: React.FC<SelectProps> = ({ value, onValueChange, children, className }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedLabel, setSelectedLabel] = React.useState("")
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  // Close when clicking outside the entire select container (trigger + dropdown)
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick)
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [isOpen])

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen, selectedLabel, setSelectedLabel, triggerRef }}>
      <div ref={containerRef} className={cn("relative inline-block w-full", className)}>{children}</div>
    </SelectContext.Provider>
  )
}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectTrigger must be used within Select")
  const { isOpen, setIsOpen, selectedLabel, triggerRef } = context

  // Forward ref helper
  React.useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement)

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-2 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer hover:border-slate-300",
        className
      )}
      {...props}
    >
      {selectedLabel ? <span className="truncate">{selectedLabel}</span> : children}
      <ChevronDown className={cn("h-4 w-4 ml-2 text-slate-400 transition-transform duration-200", isOpen && "transform rotate-180")} />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectValue must be used within Select")
  const { value } = context
  return !value ? <span className="text-slate-400 font-medium">{placeholder}</span> : null
}

export const SelectContent: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectContent must be used within Select")
  const { isOpen } = context

  if (!isOpen) return null

  return (
    <div
      className={cn(
        "absolute z-[100] mt-1.5 max-h-60 w-full min-w-[12rem] overflow-y-auto rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-top-1 duration-200",
        className
      )}
    >
      {children}
    </div>
  )
}

export const SelectItem: React.FC<{ value: string; children?: React.ReactNode; className?: string }> = ({ value, children, className }) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectItem must be used within Select")
  const { value: activeValue, onValueChange, setIsOpen, setSelectedLabel } = context

  const isActive = activeValue === value

  React.useEffect(() => {
    if (isActive && children) {
      setSelectedLabel(String(children))
    }
  }, [isActive, children, setSelectedLabel])

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onValueChange?.(value)
    if (children) {
      setSelectedLabel(String(children))
    }
    setIsOpen(false)
  }

  return (
    <button
      type="button"
      onClick={handleSelect}
      className={cn(
        "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 cursor-pointer text-left focus:outline-none focus:bg-slate-50",
        isActive && "bg-emerald-50/40 text-teal-600 font-bold",
        className
      )}
    >
      <span className="truncate">{children}</span>
      {isActive && <Check className="h-3.5 w-3.5 text-teal-600 shrink-0" />}
    </button>
  )
}
