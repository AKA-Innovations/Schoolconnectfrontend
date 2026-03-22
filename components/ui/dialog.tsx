import * as React from "react"
import { cn } from "../../lib/utils"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

interface DialogTriggerProps {
  asChild?: boolean
  children?: React.ReactNode
}

interface DialogContentProps {
  className?: string
  children?: React.ReactNode
}

interface DialogHeaderProps {
  className?: string
  children?: React.ReactNode
}

interface DialogTitleProps {
  className?: string
  children?: React.ReactNode
}

const DialogContext = React.createContext<{
  open?: boolean
  onOpenChange?: (open: boolean) => void
}>({})

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

const DialogTrigger: React.FC<DialogTriggerProps> = ({ asChild, children }) => {
  const { onOpenChange } = React.useContext(DialogContext)
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: () => onOpenChange?.(true)
    } as any)
  }
  
  return (
    <button onClick={() => onOpenChange?.(true)}>
      {children}
    </button>
  )
}

const DialogContent: React.FC<DialogContentProps> = ({ className, children }) => {
  const { open, onOpenChange } = React.useContext(DialogContext)
  
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange?.(false)}
      />
      <div className={cn(
        "relative z-50 grid w-full max-w-lg gap-4 border border-gray-200 bg-white p-6 shadow-lg duration-200 sm:rounded-lg",
        className
      )}>
        {children}
      </div>
    </div>
  )
}

const DialogHeader: React.FC<DialogHeaderProps> = ({ className, children }) => {
  return (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>
      {children}
    </div>
  )
}

const DialogTitle: React.FC<DialogTitleProps> = ({ className, children }) => {
  return (
    <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
      {children}
    </h2>
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
}