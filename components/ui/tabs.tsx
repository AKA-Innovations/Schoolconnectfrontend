import * as React from "react"
import { cn } from "../../lib/utils"

interface TabsProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children?: React.ReactNode
  className?: string
}

const TabsContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
}>({ value: "", onValueChange: () => {} })

const Tabs: React.FC<TabsProps> = ({ value, defaultValue = "", onValueChange, children, className }) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const activeValue = value !== undefined ? value : internalValue

  const handleChange = React.useCallback((newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }, [value, onValueChange])

  return (
    <TabsContext.Provider value={{ value: activeValue, onValueChange: handleChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  )
}

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted/50 p-1 text-muted-foreground gap-1 border border-border",
      className
    )}
    {...props}
  />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, value, ...props }, ref) => {
  const { value: activeValue, onValueChange } = React.useContext(TabsContext)
  const isActive = activeValue === value

  return (
    <button
      ref={ref}
      onClick={() => onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-ring disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-card text-primary shadow-sm font-semibold"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
      {...props}
    />
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => {
  const { value: activeValue } = React.useContext(TabsContext)
  if (activeValue !== value) return null

  return (
    <div
      ref={ref}
      className={cn(
        "mt-4 focus-visible:outline-none animate-in fade-in-50 duration-200",
        className
      )}
      {...props}
    />
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }