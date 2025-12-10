export function isTruthy<T>(obj: T) {
  return !!obj
}

export function not<T extends (...args: unknown[]) => unknown>(func: T) {
  return ((...args: unknown[]) => !func(...args)) as typeof func
}
