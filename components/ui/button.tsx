import * as React from "react"
import { cn } from "../../lib/utils"
import { Loader2 } from "lucide-react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: 'default' | 'primary' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'premium' | 'white' | 'danger'
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'md' | 'xs'
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, loading, disabled, children, ...props }, ref) => {
    const Comp = asChild ? "span" : "button"

    const variants = {
      default: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all",
      primary: "bg-primary hover:bg-primary-hover text-white shadow-primary/20 hover:shadow-lg hover:shadow-primary/30",
      destructive: "bg-rose-500 text-white hover:bg-rose-600 shadow-sm",
      danger: "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60",
      outline: "border border-border bg-transparent hover:bg-accent text-foreground transition-colors",
      secondary: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-slate-200/50",
      premium: "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm transition-all",
      ghost: "text-slate-500 hover:text-primary hover:bg-primary/5",
      link: "text-primary underline-offset-4 hover:underline",
      white: "bg-white text-slate-900 border border-slate-200 hover:border-slate-300 shadow-sm",
    }

    const sizes = {
      default: "h-10 px-4 py-2",
      xs: "px-3 py-1.5 text-[10px] rounded-lg tracking-wider uppercase",
      sm: "px-4 py-2 text-xs",
      md: "px-5 py-2.5 text-sm h-auto",
      lg: "px-7 py-3.5 text-base h-auto",
      icon: "h-9 w-9 p-0",
    }

    const base = 'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-300 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20'

    return (
      <Comp
        className={cn(base, variants[variant as keyof typeof variants] || variants.primary, sizes[size as keyof typeof sizes] || sizes.md, className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button }
