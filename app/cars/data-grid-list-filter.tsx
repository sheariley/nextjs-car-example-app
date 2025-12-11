'use client'

import { DropdownMenuArrow } from '@radix-ui/react-dropdown-menu'
import { Filter, FunnelXIcon } from 'lucide-react'
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
import { cn, toggleArrayValue } from '@/lib/utils'

export type DataGridListFilterProps<TKey extends DataGridListFilterOptionKey = string> =
  React.ComponentPropsWithoutRef<'div'> & {
    filterTitle: string
    labelRenderer?: () => string | JSX.Element
    options: DataGridListFilterOption<TKey>[]
    selectedOptions: TKey[]
    onFilterChange: (keys: TKey[]) => void
  }

export type DataGridListFilterOptionKey = string | number | Date

export type DataGridListFilterOption<TKey extends DataGridListFilterOptionKey = string> = {
  key: TKey
  label: string
}

export default function DataGridListFilter<TKey extends DataGridListFilterOptionKey = string>({
  filterTitle,
  options,
  selectedOptions,
  className,
  labelRenderer,
  onFilterChange,
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
    (key: TKey, event: React.MouseEvent) => {
      event.stopPropagation()
      event.preventDefault()
      const updatedSelections = toggleArrayValue(selectedOptions, key)
      onFilterChange(updatedSelections)
    },
    [onFilterChange, selectedOptions]
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
    <div
      className={cn('flex items-center justify-between gap-2 *:first:items-center *:first:gap-2', className)}
      {...props}
    >
      {labelRenderer ? labelRenderer() : <span className="font-medium">{filterTitle}</span>}
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Filter ${filterTitle}`}
            className={selectedOptions.length ? 'text-primary' : ''}
          >
            <Filter className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 p-2" align="start" onClick={e => e.stopPropagation()}>
          <DropdownMenuArrow className="fill-card stroke-muted-foreground" />
          <DropdownMenuLabel className="flex justify-between items-center">
            <span>Filter {filterTitle}</span>
            <Button
              variant="ghost"
              onClick={() => onFilterChange([])}
            >
              <FunnelXIcon className="size-4" />
            </Button>
          </DropdownMenuLabel>
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
                onClick={e => handleToggleOption(o.key, e)}
                checked={selectedOptions.includes(o.key)}
                onPointerLeave={cancelPointerEventWhenSearchFocused}
                onPointerMove={cancelPointerEventWhenSearchFocused}
              >
                {o.label}
              </DropdownMenuCheckboxItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
