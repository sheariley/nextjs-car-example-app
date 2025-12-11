'use client'

import { PopoverArrow } from '@radix-ui/react-popover'
import { Filter, RotateCcw } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { NumberRangeFilterValues } from '@/lib/store'
import { cn } from '@/lib/utils'

export type DataGridNumberRangeFilterProps = React.ComponentPropsWithoutRef<'div'> & {
  filterTitle?: string
  labelRenderer?: () => React.ReactNode
  minLabel?: string
  maxLabel?: string
  rangeValues?: NumberRangeFilterValues
  step?: number
  placeholderMin?: string
  placeholderMax?: string
  onChange?: (values: NumberRangeFilterValues) => void
}

export default function DataGridNumberRangeFilter({
  filterTitle = 'Range',
  labelRenderer,
  minLabel = 'Min',
  maxLabel = 'Max',
  rangeValues: { min: minValue, max: maxValue } = {},
  step = 1,
  placeholderMin,
  placeholderMax,
  onChange,
  className,
  ...props
}: DataGridNumberRangeFilterProps) {
  const filterActive = typeof minValue === 'number' || typeof maxValue === 'number'

  const [min, setMin] = React.useState<number | null>(typeof minValue === 'number' ? minValue : null)
  const [max, setMax] = React.useState<number | null>(typeof maxValue === 'number' ? maxValue : null)

  React.useEffect(() => {
    setMin(typeof minValue === 'number' ? minValue : null)
  }, [minValue])

  React.useEffect(() => {
    setMax(typeof maxValue === 'number' ? maxValue : null)
  }, [maxValue])

  const handleMinInput = (e: React.FormEvent<HTMLInputElement>) => {
    const v = e.currentTarget.value
    const parsed = v === '' ? null : Number(v)
    setMin(parsed)
  }

  const handleResetMin = () => {
    const reset = typeof minValue === 'number' ? minValue : null
    setMin(reset)
  }

  const handleMaxInput = (e: React.FormEvent<HTMLInputElement>) => {
    const v = e.currentTarget.value
    const parsed = v === '' ? null : Number(v)
    setMax(parsed)
  }

  const handleResetMax = () => {
    const reset = typeof maxValue === 'number' ? maxValue : null
    setMax(reset)
  }

  const handleApply = () => {
    if (typeof onChange === 'function') onChange({ min, max })
  }

  const handleClear = () => {
    setMin(null)
    setMax(null)
    if (typeof onChange === 'function') onChange({ min: null, max: null })
  }

  return (
    <div
      className={cn('flex items-center justify-between gap-2 *:first:items-center *:first:gap-2', className)}
      {...props}
    >
      {labelRenderer ? labelRenderer() : <span className="font-medium">{filterTitle}</span>}

      <Popover>
        <PopoverTrigger asChild onClick={e => e.stopPropagation()} className={filterActive ? 'text-primary' : ''}>
          <Button variant="ghost" size="icon" aria-label={`Filter ${filterTitle}`}>
            <Filter className="size-4" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-64 p-4" align="start" onClick={e => e.stopPropagation()}>
          <PopoverArrow className="fill-card stroke-muted-foreground" />

          <div className="space-y-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm">{minLabel}</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={min === null ? '' : String(min)}
                  onInput={handleMinInput}
                  placeholder={placeholderMin}
                  step={step}
                  aria-label={minLabel}
                />
                {min !== (typeof minValue === 'number' ? minValue : null) && (
                  <Button variant="ghost" size="icon" onClick={handleResetMin} aria-label="Reset min">
                    <RotateCcw className="size-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm">{maxLabel}</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={max === null ? '' : String(max)}
                  onInput={handleMaxInput}
                  placeholder={placeholderMax}
                  step={step}
                  aria-label={maxLabel}
                />
                {max !== (typeof maxValue === 'number' ? maxValue : null) && (
                  <Button variant="ghost" size="icon" onClick={handleResetMax} aria-label="Reset max">
                    <RotateCcw className="size-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={handleClear} aria-label="Clear range">
                Clear
              </Button>
              <Button size="sm" onClick={handleApply} aria-label="Apply range">
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
