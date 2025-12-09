'use client'

import { DropdownMenuArrow } from '@radix-ui/react-dropdown-menu'
import { Filter } from 'lucide-react'
import React, { FormEvent, JSX, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type DataGridListFilterProps<TKey extends DataGridListFilterOptionKeyValue = string> =
  React.ComponentPropsWithoutRef<'div'> & {
    filterTitle: string
    labelRenderer?: () => string | JSX.Element
    options: DataGridListFilterOption<TKey>[]
    selectedOptions: TKey[]
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
  selectedOptions,
  className,
  labelRenderer,
  onToggleOption,
  ...props
}: DataGridListFilterProps<TKey>) {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState(searchTerm)
  const [searchFocused, setSearchFocused] = React.useState(false)

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 650)

    return () => clearTimeout(handle)
  }, [searchTerm])

  const handleToggleOption = React.useCallback(
    (key: TKey) => {
      if (typeof onToggleOption === 'function') onToggleOption(key)
    },
    [onToggleOption]
  )

  const handleSearchInput = React.useCallback((event: FormEvent<HTMLInputElement>) => {
    event.stopPropagation()
    setSearchTerm(event.currentTarget.value)
  }, [])

  const filteredOptions = React.useMemo(() => {
    if (!debouncedSearchTerm.length) return options

    // for case insensitivity
    const searchRegex = new RegExp(debouncedSearchTerm, 'i')
    return options.filter(o => searchRegex.test(o.label))
  }, [options, debouncedSearchTerm])

  const cancelPointerEventWhenSearchFocused = React.useCallback(
    (event: React.PointerEvent) => {
      if (searchFocused) event.preventDefault()
    },
    [searchFocused]
  )

  return (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      {labelRenderer ? labelRenderer() : <span className="font-medium">{filterTitle}</span>}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Filter ${filterTitle}`}>
            <Filter className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 p-2" align="start">
          <DropdownMenuArrow />
          <DropdownMenuLabel>Filter {filterTitle}</DropdownMenuLabel>
          <div className="py-1">
            <Input
              placeholder={`Search ${filterTitle}`}
              value={searchTerm}
              type="search"
              onInput={handleSearchInput}
              onKeyDown={e => e.stopPropagation()}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
          <DropdownMenuSeparator />
          <div className="max-h-48 overflow-auto">
            {filteredOptions.map(o => (
              <DropdownMenuCheckboxItem
                key={String(o.key)}
                textValue={o.label}
                onClick={() => handleToggleOption(o.key)}
                checked={selectedOptions.includes(o.key)}
                onPointerLeave={cancelPointerEventWhenSearchFocused}
                onPointerMove={cancelPointerEventWhenSearchFocused}
              >
                {o.label} <span className="text-muted-foreground ml-auto text-xs">{o.count}</span>
              </DropdownMenuCheckboxItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
