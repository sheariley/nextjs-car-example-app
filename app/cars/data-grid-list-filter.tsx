'use client'

import React from 'react';
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Filter } from 'lucide-react'

import { cn } from "@/lib/utils"

export type DataGridListFilterProps<TKey extends DataGridListFilterOptionKeyValue = string> = React.ComponentPropsWithoutRef<'div'> & {
  filterTitle: string
  labelRenderer?: () => React.ReactNode
  options: DataGridListFilterOption<TKey>[]
  onToggleOption?: (key: TKey) => void
}

export type DataGridListFilterOptionKeyValue = string | number | Date

export type DataGridListFilterOption<TKey extends DataGridListFilterOptionKeyValue = string> = {
  key: TKey
  label: string
  count?: number
}

export default function DataGridListFilter<TKey extends DataGridListFilterOptionKeyValue = string>({
  filterTitle,
  options,
  className,
  labelRenderer,
  onToggleOption,
  ...props
}: DataGridListFilterProps<TKey>) {

  const handleToggleOption = React.useCallback((key: TKey) => {
    if (typeof onToggleOption === 'function') onToggleOption(key)
  }, [onToggleOption])

  return (
    <div className={cn(
      'flex items-center gap-2',
      className
    )} {...props}>
      { labelRenderer
        ? labelRenderer()
        : <span className="font-medium">{filterTitle}</span>
      }
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Filter ${filterTitle}`}>
            <Filter className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 p-2">
          <DropdownMenuLabel>Filter {filterTitle}</DropdownMenuLabel>
          <div className="py-1">
            <Input placeholder={`Search ${filterTitle}`} />
          </div>
          <DropdownMenuSeparator />
          <div className="max-h-48 overflow-auto">
            {options.map(o => (
              <DropdownMenuCheckboxItem key={String(o.key)} onClick={() => handleToggleOption(o.key)}>
                {o.label} <span className="ml-auto text-xs text-muted-foreground">{o.count}</span>
              </DropdownMenuCheckboxItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}