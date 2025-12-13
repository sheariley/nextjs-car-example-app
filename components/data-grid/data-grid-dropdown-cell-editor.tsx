'use client'

import { DropdownMenuArrow } from '@radix-ui/react-dropdown-menu'
import { ChevronDownIcon } from 'lucide-react'
import React, { FormEvent, JSX } from 'react'
import { CalculatedColumn, RenderEditCellProps } from 'react-data-grid'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { cn, toggleArrayValue } from '@/lib/utils'
import { defaultValueGetter, defaultValueSetter } from './data-grid-cell-editor-props'

export type DataGridDropdownCellEditorValueType = string | number

export type DataGridDropdownCellEditorOption<TValue extends DataGridDropdownCellEditorValueType> = {
  value: TValue
  label: string
}

export type DataGridDropdownSingleValueCellEditorProps<
  TValue extends DataGridDropdownCellEditorValueType,
  TRow,
  TSummaryRow = unknown,
> = RenderEditCellProps<TRow, TSummaryRow> & {
  className?: string
  options: DataGridDropdownCellEditorOption<TValue>[]
  multiple: false
  valueRenderer?: SingleValueRenderer<TValue>
  valueGetter?: SingleValueGetter<TValue, TRow, TSummaryRow>
  valueSetter?: SingleValueSetter<TValue, TRow, TSummaryRow>
}

export type DataGridDropdownMultiValueCellEditorProps<
  TValue extends DataGridDropdownCellEditorValueType,
  TRow,
  TSummaryRow = unknown,
> = RenderEditCellProps<TRow, TSummaryRow> & {
  className?: string
  options: DataGridDropdownCellEditorOption<TValue>[]
  multiple: true
  valueRenderer?: MultiValueRenderer<TValue>
  valueGetter?: MultiValueGetter<TValue, TRow, TSummaryRow>
  valueSetter?: MultiValueSetter<TValue, TRow, TSummaryRow>
}

export type DataGridDropdownCellEditorProps<
  TValue extends DataGridDropdownCellEditorValueType,
  TRow,
  TSummaryRow = unknown,
> =
  | DataGridDropdownSingleValueCellEditorProps<TValue, TRow, TSummaryRow>
  | DataGridDropdownMultiValueCellEditorProps<TValue, TRow, TSummaryRow>

function autoFocus(element: HTMLButtonElement) {
  element?.focus()
}

export function DataGridDropdownCellEditor<
  TValue extends DataGridDropdownCellEditorValueType,
  TRow,
  TSummaryRow = unknown,
>({
  className,
  row,
  column,
  options,
  multiple = false,
  valueRenderer = defaultValueRenderer,
  valueGetter = defaultValueGetter,
  valueSetter = defaultValueSetter,
  onRowChange
}: DataGridDropdownCellEditorProps<TValue, TRow, TSummaryRow>) {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState(searchTerm)
  const [searchFocused, setSearchFocused] = React.useState(false)

  React.useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 650)

    return () => clearTimeout(handle)
  }, [searchTerm])

  const handleToggleOption = React.useCallback(
    (value: TValue, event: EventLike) => {
      event.stopPropagation()
      event.preventDefault()
      if (isMultiValueSetter<TValue, TRow, TSummaryRow>(multiple, valueSetter)) {
        const selectedOptions = valueGetter(row, column) as TValue[]
        const updatedSelections = toggleArrayValue(selectedOptions, value)
        const updatedRow = valueSetter(updatedSelections, row, column)
        onRowChange(updatedRow, false)
      } else {
        const updatedRow = valueSetter(value, row, column)
        onRowChange(updatedRow)
      }
    },
    [multiple, row, column, onRowChange, valueGetter, valueSetter]
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

  const cellValue = valueGetter(row, column)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          ref={autoFocus}
          variant="link"
          size="sm"
          className={cn('justify-between select-none hover:bg-accent w-full rounded-none', className)}
        >
          <span>
            {isMultiValueRenderer<TValue>(multiple, valueRenderer)
              ? valueRenderer(cellValue as TValue[])
              : valueRenderer(cellValue as TValue)}
          </span>
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuArrow className="fill-card stroke-muted-foreground" />
        <div className="py-1">
          <Input
            placeholder="Search"
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
          {multiple ? (
            filteredOptions.map(o => (
              <DropdownMenuCheckboxItem
                key={String(o.value)}
                textValue={o.label}
                onClick={e => handleToggleOption(o.value, e)}
                checked={(cellValue as TValue[]).includes(o.value)}
                onPointerLeave={cancelPointerEventWhenSearchFocused}
                onPointerMove={cancelPointerEventWhenSearchFocused}
              >
                {o.label}
              </DropdownMenuCheckboxItem>
            ))
          ) : (
            <DropdownMenuRadioGroup value={cellValue as string}>
              {filteredOptions.map(o => (
                <DropdownMenuRadioItem
                  key={o.value}
                  value={o.value.toString()}
                  onSelect={e => handleToggleOption(o.value, e)}
                >
                  {o.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function defaultValueRenderer<TValue extends DataGridDropdownCellEditorValueType>(value: TValue) {
  return value as string
}

type SingleValueRenderer<TValue extends DataGridDropdownCellEditorValueType> = (value: TValue) => string | JSX.Element
type MultiValueRenderer<TValue extends DataGridDropdownCellEditorValueType> = (value: TValue[]) => string | JSX.Element

type SingleValueGetter<TValue extends DataGridDropdownCellEditorValueType, TRow, TSummaryRow = unknown> = (
  row: TRow,
  column: CalculatedColumn<TRow, TSummaryRow>
) => TValue
type MultiValueGetter<TValue extends DataGridDropdownCellEditorValueType, TRow, TSummaryRow = unknown> = (
  row: TRow,
  column: CalculatedColumn<TRow, TSummaryRow>
) => TValue[]

type SingleValueSetter<TValue extends DataGridDropdownCellEditorValueType, TRow, TSummaryRow = unknown> = (
  value: TValue,
  row: TRow,
  column: CalculatedColumn<TRow, TSummaryRow>
) => TRow
type MultiValueSetter<TValue extends DataGridDropdownCellEditorValueType, TRow, TSummaryRow = unknown> = (
  value: TValue[],
  row: TRow,
  column: CalculatedColumn<TRow, TSummaryRow>
) => TRow

function isMultiValueRenderer<TValue extends DataGridDropdownCellEditorValueType>(
  multiple: boolean,
  valueRenderer: unknown
): valueRenderer is MultiValueRenderer<TValue> {
  return multiple
}

// function isMultiValueGetter<TValue extends DataGridDropdownCellEditorValueType, TRow, TSummaryRow = unknown>(
//   multiple: boolean,
//   valueGetter: unknown
// ): valueGetter is MultiValueGetter<TValue, TRow, TSummaryRow> {
//   return multiple
// }

function isMultiValueSetter<TValue extends DataGridDropdownCellEditorValueType, TRow, TSummaryRow = unknown>(
  multiple: boolean,
  valueSetter: unknown
): valueSetter is MultiValueSetter<TValue, TRow, TSummaryRow> {
  return multiple
}

type EventLike = {
  preventDefault(): void
  stopPropagation(): void
}
