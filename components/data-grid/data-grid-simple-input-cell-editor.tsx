'use client'

import { DetailedHTMLProps, HTMLInputTypeAttribute, InputHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'
import { DataGridCellEditorProps, defaultValueGetter, defaultValueSetter } from './data-grid-cell-editor-props'

export type DataGridSimpleInputCellEditorProps<TRow, TSummaryRow = unknown, TValue = unknown> = DataGridCellEditorProps<
  TRow,
  TSummaryRow,
  TValue
> & {
  type: HTMLInputTypeAttribute
}

function autoFocusAndSelect(input: HTMLInputElement | null) {
  input?.focus()
  input?.select()
}

export function DataGridSimpleInputCellEditor<
  TRow,
  TSummaryRow = unknown,
  TValue extends HTMLInputValueType = HTMLInputValueType,
>({
  className,
  type,
  row,
  column,
  valueGetter = defaultValueGetter,
  valueSetter = defaultValueSetter,
  onRowChange,
  onClose,
}: DataGridSimpleInputCellEditorProps<TRow, TSummaryRow, TValue>) {
  const value = valueGetter(row, column) as TValue

  const handleOnChange = (newValue: TValue) => {
    const updatedRow = valueSetter(newValue as TValue, row, column)
    onRowChange(updatedRow)
  }

  return (
    <input
      type={type}
      ref={autoFocusAndSelect}
      className={cn('rdg-text-editor rdg-input-editor', className)}
      value={value}
      onChange={e => handleOnChange(e.target.value as TValue)}
      onBlur={() => onClose(true, false)}
    />
  )
}

type HTMLInputValueType = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>['value']
