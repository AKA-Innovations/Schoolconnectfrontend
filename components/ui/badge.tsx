import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'premium'
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-[hsl(var(--primary-subtle))] text-[hsl(var(--primary))]",
    secondary: "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
    destructive: "bg-[hsl(var(--destructive-subtle))] text-[hsl(var(--destructive))]",
    outline: "border border-[hsl(var(--border))] text-[hsl(var(--foreground))] bg-transparent",
    success: "bg-[hsl(var(--success-subtle))] text-[hsl(var(--success))]",
    warning: "bg-[hsl(var(--warning-subtle))] text-[hsl(var(--warning-foreground))]",
    premium: "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] font-bold",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }