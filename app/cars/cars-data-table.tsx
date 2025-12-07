'use client'

import useCarDataApiClient from '@/api-clients/mock-car-data-api-client'
import { Checkbox, CheckboxChangeHandler } from '@/components/ui/checkbox'
import { CarDetail } from '@/types/car-detail'
import React, { MouseEvent, useCallback, useEffect, useState } from 'react'
import { Column, DataGrid, RenderCheckboxProps, renderHeaderCell, RenderHeaderCellProps, SelectColumn } from 'react-data-grid'
import DataGridListFilter, { DataGridListFilterOption } from './data-grid-list-filter'

export default function CarsDataTable() {
  const dataClient = useCarDataApiClient()
  const [rows, setRows] = useState<CarDetail[]>([])
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<string>>(new Set<string>())
  const [filters, setFilters] = useState<Record<CarDetailFilterablePropKeys, Set<CarDetailFilterOptionKey>>>({
    carMakeId: new Set<CarDetailFilterOptionKey>(),
    carModelId: new Set<CarDetailFilterOptionKey>()
  })
  const [columnOptions, setColumnOptions] = useState<Record<
    CarDetailFilterablePropKeys,
    DataGridListFilterOption<CarDetailFilterOptionKey>[]
  >>({
    carMakeId: [],
    carModelId: []
  })
  
  useEffect(() => {
    async function fetchCarDetails() {
      const data = await dataClient.getCarDetails()
      setRows(data)
    }

    fetchCarDetails()
  }, [dataClient])

  // prefetch options for known columns (makeId, modelId, year)
  useEffect(() => {
    async function fetchOptions() {
      if (rows.length === 0) return
      try {
        const makes = await dataClient.getCarMakes()
        const models = await dataClient.getCarModels()

        const makeCounts = new Map<string, number>()
        const modelCounts = new Map<string, number>()

        for (const r of rows) {
          makeCounts.set(r.carMakeId, (makeCounts.get(r.carMakeId) ?? 0) + 1)
          modelCounts.set(r.carModelId, (modelCounts.get(r.carModelId) ?? 0) + 1)
        }

        setColumnOptions({
          carMakeId: (makes as { id: string; name: string }[]).map(m => ({ key: m.id, label: m.name, count: makeCounts.get(m.id) ?? 0 })),
          carModelId: (models as { id: string; name: string }[]).map(m => ({ key: m.id, label: m.name, count: modelCounts.get(m.id) ?? 0 }))
        })
      } catch {
        // ignore
      }
    }

    fetchOptions()
  }, [rows, dataClient])
  
  // apply basic client-side filters
  const filteredRows = React.useMemo(() => rows.filter(r => {
    for (const [col, set] of Object.entries(filters)) {
      if (!set || set.size === 0) continue
      // map column key to actual CarDetail prop
      const value = col === 'makeId' ? r.carMakeId : col === 'modelId' ? r.carModelId : r[col as CarDetailFilterablePropKeys]
      if (!set.has(String(value)) && !set.has(value)) return false
    }
    return true
  }), [filters, rows])

  const columns = React.useMemo(() => columnsFactory({
    onToggleFilterOption: (columnKey: CarDetailFilterablePropKeys, optionKey: CarDetailFilterOptionKey) => {
      setFilters(prev => {
        const next = { ...prev }
        const setFor = next[columnKey] ? new Set(next[columnKey]) : new Set<CarDetailFilterOptionKey>()
        const k = optionKey
        if (setFor.has(k)) setFor.delete(k)
        else setFor.add(k)
        next[columnKey] = setFor
        return next
      })
    },
    options: columnOptions
  }), [columnOptions])

  return (
    <div className="container mx-auto py-10">
      <DataGrid
       columns={columns}
       rows={filteredRows}
       rowKeyGetter={carRowKeyGetter}
       selectedRows={selectedRows}
       onSelectedRowsChange={setSelectedRows}
       renderers={{
        renderCheckbox: DataTableCheckbox
       }}
      />
    </div>
  )
}

type CarDetailFilterablePropKeys = keyof Pick<CarDetail, 'carMakeId' | 'carModelId'>

type CarDetailFilterOptionKey = string | number

type ColumnsFactoryProps = {
  onToggleFilterOption: (columnKey: CarDetailFilterablePropKeys, optionKey: CarDetailFilterOptionKey) => void
  options: Record<
    CarDetailFilterablePropKeys,
    DataGridListFilterOption<CarDetailFilterOptionKey>[]
  >
}

function columnsFactory({ onToggleFilterOption, options }: ColumnsFactoryProps): Column<CarDetail>[] {
  // header renderer factory that shows a filter icon and a popover with options
  const renderHeader = (columnKey: CarDetailFilterablePropKeys, columnName: string) => {
    const renderer = (renderProps: RenderHeaderCellProps<CarDetail>) => {
      const opts = options[columnKey] ?? []
  
      return (
        <DataGridListFilter
          filterTitle={columnName}
          labelRenderer={() => renderHeaderCell(renderProps)}
          options={opts}
          onToggleOption={oKey => onToggleFilterOption(columnKey, oKey)}
        />
      )
    }
    renderer.displayName = 'DataGridColumnFilter'

    return renderer
  }

  return [
    SelectColumn,
    {
      name: 'Make',
      key: 'makeId',
      renderCell: props => props.row.CarMake?.name,
      sortable: true,
      renderHeaderCell: renderHeader('carMakeId', 'Make')
    },
    {
      name: 'Model',
      key: 'modelId',
      renderCell: props => props.row.CarModel?.name,
      sortable: true,
      renderHeaderCell: renderHeader('carModelId', 'Model')
    },
    {
      name: 'Year',
      key: 'year',
      sortable: true,
      // renderHeaderCell: renderHeader('year', 'Year')
    }
  ]
}

function carRowKeyGetter(row: CarDetail) {
  return row.id;
}

// custom renderer to use ShadCN's checkbox in the data-grid
function DataTableCheckbox(props: RenderCheckboxProps) {  
  const {
    onChange,
    indeterminate,
    checked,
    ...commonProps
  } = props

  const changeHandler = useCallback<CheckboxChangeHandler>((event, checkedState) => {
    const shift = (event.nativeEvent as unknown as MouseEvent<HTMLInputElement>).shiftKey
    onChange(checkedState === true, shift)
  }, [onChange])

  return (
    <Checkbox
      checked={indeterminate ? 'indeterminate' : checked}
      onCheckedChange={changeHandler}
      {...commonProps}
    />
  )
}
