"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type CheckboxRef = React.ComponentRef<typeof CheckboxPrimitive.Root>

export type CheckboxChangeHandler = (e: React.ChangeEvent<HTMLInputElement>, checked: CheckboxPrimitive.CheckedState) => void

export interface CheckboxProps extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, 'onCheckedChange' | 'checked' | 'defaultChecked'> {
  onCheckedChange?: CheckboxChangeHandler
  defaultChecked?: CheckboxPrimitive.CheckedState
  checked?: CheckboxPrimitive.CheckedState
}

const Checkbox = React.forwardRef<CheckboxRef, CheckboxProps>(({ className, onCheckedChange, defaultChecked, checked: controlledChecked, ...props }, ref) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const [uncontrolledChecked, setUncontrolledChecked] = React.useState<CheckboxPrimitive.CheckedState>(
    (defaultChecked as CheckboxPrimitive.CheckedState) ?? false
  )

  const isControlled = controlledChecked !== undefined
  const currentChecked = isControlled ? controlledChecked! : uncontrolledChecked

  // Needed because you cannot set the indeterminate property of 
  // an input using HTML attribute bindings.
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = (currentChecked === 'indeterminate')
    }
  }, [currentChecked, inputRef])

  // When the native input changes, update internal state (only when uncontrolled) and
  // forward the native ChangeEvent to consumer
  const handleNativeChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.indeterminate ? 'indeterminate' : e.target.checked as CheckboxPrimitive.CheckedState
    if (!isControlled) setUncontrolledChecked(next)
    if (typeof onCheckedChange === 'function') onCheckedChange(e, next)
  }, [isControlled, onCheckedChange])
  
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      data-slot="checkbox"
      className={cn(
        "relative peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-lg border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      checked={currentChecked}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>

      {/* Native input placed on top of the visual element so it receives real ChangeEvents (with modifiers). */}
      <input
        ref={inputRef}
        type="checkbox"
        checked={currentChecked === true}
        onChange={handleNativeChange}
        className="absolute inset-0 w-full h-full opacity-0 m-0 p-0 cursor-pointer"
      />
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
