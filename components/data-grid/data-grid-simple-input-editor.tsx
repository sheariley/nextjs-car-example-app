import { cn } from '@/lib/utils'
import { DetailedHTMLProps, HTMLInputTypeAttribute, InputHTMLAttributes } from 'react'
import { CalculatedColumn, RenderEditCellProps } from 'react-data-grid'

export type DataGridEditorProps<TRow, TSummaryRow = unknown, TValue = unknown> = RenderEditCellProps<
  TRow,
  TSummaryRow
> & {
  className?: string
  valueGetter?: (row: TRow, column: CalculatedColumn<TRow, TSummaryRow>) => TValue
  valueSetter?: (value: TValue, row: TRow, column: CalculatedColumn<TRow, TSummaryRow>) => TRow
}

export type DataGridSimpleInputEditorProps<TRow, TSummaryRow = unknown, TValue = unknown> = DataGridEditorProps<
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

export function DataGridSimpleInputEditor<
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
}: DataGridSimpleInputEditorProps<TRow, TSummaryRow, TValue>) {
  const value = valueGetter(row, column) as TValue

  const handleOnChange = (newValue: TValue) => {
    const updatedRow = valueSetter(newValue as TValue, row, column)
    onRowChange(updatedRow)
  }

  return (
    <input
      type={type}
      ref={autoFocusAndSelect}
      className={cn('rdg-text-editor rdg-simple-input-editor', className)}
      value={value}
      onChange={e => handleOnChange(e.target.value as TValue)}
      onBlur={() => onClose(true, false)}
    />
  )
}

export function defaultValueGetter<TRow, TSummaryRow = unknown, TValue = unknown>(
  row: TRow,
  column: CalculatedColumn<TRow, TSummaryRow>
): TValue {
  return row[column.key as keyof TRow] as TValue
}

export function defaultValueSetter<TRow, TSummaryRow = unknown, TValue = unknown>(
  value: TValue,
  row: TRow,
  column: CalculatedColumn<TRow, TSummaryRow>
): TRow {
  return { ...row, [column.key]: value }
}

type HTMLInputValueType = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>['value']
