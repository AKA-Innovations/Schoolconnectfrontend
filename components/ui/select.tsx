import * as React from "react"
import { cn } from "../../lib/utils"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children?: React.ReactNode
  disabled?: boolean
}

interface SelectTriggerProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  children?: React.ReactNode
}

interface SelectContentProps {
  children?: React.ReactNode
}

interface SelectItemProps {
  value: string
  children?: React.ReactNode
  disabled?: boolean
  className?: string
}

interface SelectValueProps {
  placeholder?: string
}

const SelectContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
  options: React.ReactNode[]
  setOptions: (nodes: React.ReactNode[]) => void
}>({ options: [], setOptions: () => {} })

const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  const [options, setOptions] = React.useState<React.ReactNode[]>([])
  return (
    <SelectContext.Provider value={{ value, onValueChange, options, setOptions }}>
      {children}
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<HTMLSelectElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { value, onValueChange, options } = React.useContext(SelectContext)
    
    return (
      <select
        ref={ref}
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          className
        )}
        {...props}
      >
        {children}
        {options}
      </select>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
  return <option value="" disabled>{placeholder}</option>
}

const SelectContent: React.FC<SelectContentProps> = ({ children }) => {
  const { setOptions } = React.useContext(SelectContext)
  const rendered = React.Children.toArray(children)

  React.useEffect(() => {
    setOptions(rendered)
    return () => setOptions([])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children])

  return null
}

const SelectItem: React.FC<SelectItemProps> = ({ value, children }) => {
  return <option value={value}>{children}</option>
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
}
