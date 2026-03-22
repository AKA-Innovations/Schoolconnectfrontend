import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'premium'
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-primary/10 text-primary hover:bg-primary/20",
    secondary: "border-transparent bg-secondary/10 text-secondary hover:bg-secondary/20",
    destructive: "border-transparent bg-destructive/10 text-destructive hover:bg-destructive/20",
    outline: "border-border text-foreground",
    success: "border-transparent bg-secondary/10 text-secondary hover:bg-secondary/20",
    warning: "border-transparent bg-primary/5 text-muted-foreground border-border",
    premium: "border-primary/20 bg-primary/10 text-primary font-bold",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }