import { CalculatedColumn, RenderEditCellProps } from 'react-data-grid'

export type DataGridCellEditorProps<TRow, TSummaryRow = unknown, TValue = unknown> = RenderEditCellProps<
  TRow,
  TSummaryRow
> & {
  className?: string
  valueGetter?: (row: TRow, column: CalculatedColumn<TRow, TSummaryRow>) => TValue
  valueSetter?: (value: TValue, row: TRow, column: CalculatedColumn<TRow, TSummaryRow>) => TRow
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
