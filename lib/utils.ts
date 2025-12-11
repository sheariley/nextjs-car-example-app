import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toggleArrayValue<T>(arr: T[] | null | undefined, value: T, included?: boolean): T[] {
  arr = arr || []
  if (typeof included === 'undefined') return arr.includes(value) ? arr.filter(v => v !== value) : arr.concat([value])
  else if (included && !arr.includes(value)) return arr.concat([value])
  else if (!included && arr.includes(value)) return arr.filter(v => v !== value)
  else return arr
}
