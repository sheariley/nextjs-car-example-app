'use client'

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import debounce from 'lodash/debounce';
import { Filter } from 'lucide-react';
import React, { FormEvent, useEffect } from 'react';

import { cn } from "@/lib/utils";
import { DropdownMenuArrow } from '@radix-ui/react-dropdown-menu';

export type DataGridListFilterProps<TKey extends DataGridListFilterOptionKeyValue = string> = React.ComponentPropsWithoutRef<'div'> & {
  filterTitle: string
  labelRenderer?: () => React.ReactNode
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
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [searchFocused, setSearchFocused] = React.useState(false)

  // We are using a debounced event handler, so we can't use a
  // regular value binding to sync state. Otherwise, it will cause
  // strange side-effects when the user types. This isn't really
  // necessary, but I'm syncing it anyways because OCD and posterity.
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== searchTerm) {
      inputRef.current.value = searchTerm
    }
  }, [searchTerm])

  const handleToggleOption = React.useCallback((key: TKey) => {
    if (typeof onToggleOption === 'function') onToggleOption(key)
  }, [onToggleOption])

  const updateSearchTerm = React.useMemo(() => debounce((value: string) => {
    setSearchTerm(value)
  }, 650), [])

  const handleSearchInput = React.useCallback((event: FormEvent<HTMLInputElement>) => {
    event.stopPropagation()
    updateSearchTerm(event.currentTarget.value)
  }, [updateSearchTerm])

  const filteredOptions = React.useMemo(() => {
    if (!searchTerm.length) return options

    // for case insensitivity
    const searchRegex = new RegExp(searchTerm, 'i')
    return options.filter(o => searchRegex.test(o.label))
  }, [options, searchTerm])

  const cancelPointerEventWhenSearchFocused = React.useCallback((event: React.PointerEvent) => {
    if (searchFocused) event.preventDefault()
  }, [searchFocused])

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
        <DropdownMenuContent className="w-56 p-2" align="start">
          <DropdownMenuArrow />
          <DropdownMenuLabel>Filter {filterTitle}</DropdownMenuLabel>
          <div className="py-1">
            <Input
              ref={inputRef}
              placeholder={`Search ${filterTitle}`}
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
                {o.label} <span className="ml-auto text-xs text-muted-foreground">{o.count}</span>
              </DropdownMenuCheckboxItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}