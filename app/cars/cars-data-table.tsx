'use client'

import useCarDataApiClient from '@/api-clients/mock-car-data-api-client'
import { Checkbox, CheckboxChangeHandler } from '@/components/ui/checkbox'
import { CarDetail } from '@/types/car-detail'
import React, { MouseEvent, useCallback, useEffect, useState } from 'react'
import { Column, DataGrid, RenderCheckboxProps, renderHeaderCell, RenderHeaderCellProps, SelectColumn } from 'react-data-grid'
import DataGridListFilter, { DataGridListFilterOption } from './data-grid-list-filter'
import { CarMake } from '@/types/car-make'
import { CarModel } from '@/types/car-model'

export default function CarsDataTable() {
  const dataClient = useCarDataApiClient()
  const [allMakes, setAllMakes] = useState<CarMake[]>([])
  const [allModels, setAllModels] = useState<CarModel[]>([])
  const [rows, setRows] = useState<CarDetail[]>([])
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<string>>(new Set<string>())
  const [selectedFilterOptions, setSelectedFilterOptions] = useState<Record<CarDetailFilterablePropKeys, CarDetailFilterOptionKey[]>>({
    carMakeId: [],
    carModelId: []
  })

  useEffect(() => {
    async function fetchCarMakes() {
      const data = await dataClient.getCarMakes()
      setAllMakes(data)
    }

    fetchCarMakes()
  })

  useEffect(() => {
    async function fetchCarModels() {
      const data = await dataClient.getCarModels()
      setAllModels(data)
    }

    fetchCarModels()
  })
  
  useEffect(() => {
    async function fetchCarDetails() {
      const data = await dataClient.getCarDetails()
      setRows(data)
    }

    fetchCarDetails()
  }, [dataClient])

  // prefetch options for known columns (makeId, modelId, year)
  const filterOptions = React.useMemo<Record<
    CarDetailFilterablePropKeys,
    DataGridListFilterOption<CarDetailFilterOptionKey>[]
  >>(() => {
    const makeCounts = new Map<string, number>()
    const modelCounts = new Map<string, number>()

    for (const r of rows) {
      makeCounts.set(r.carMakeId, (makeCounts.get(r.carMakeId) ?? 0) + 1)
      modelCounts.set(r.carModelId, (modelCounts.get(r.carModelId) ?? 0) + 1)
    }

    const filterMakeIds = (selectedFilterOptions.carMakeId || [])
    const filteredModels = !filterMakeIds.length ? allModels : allModels.filter(m => filterMakeIds.includes(m.carMakeId))

    return {
      carMakeId: allMakes.map(m => ({ key: m.id, label: m.name, count: makeCounts.get(m.id) ?? 0 })),
      carModelId: filteredModels.map(m => ({ key: m.id, label: m.name, count: modelCounts.get(m.id) ?? 0 }))
    }
  }, [allMakes, allModels, rows, selectedFilterOptions])
  
  // apply basic client-side filters
  const filteredRows = React.useMemo(() => rows.filter(r => {
    for (const [col, optionKeys] of Object.entries(selectedFilterOptions)) {
      if (!optionKeys || optionKeys.length === 0) continue
      // map column key to actual CarDetail property
      const value = col === 'makeId' ? r.carMakeId : col === 'modelId' ? r.carModelId : r[col as CarDetailFilterablePropKeys]
      if (!optionKeys.includes(String(value)) && !optionKeys.includes(value)) return false
    }
    return true
  }), [selectedFilterOptions, rows])

  const toggleSelectedFilterMake = React.useCallback((makeId: string) => {
    setSelectedFilterOptions(prev => {
      let filterMakeIds = prev.carMakeId || [];

      if (filterMakeIds.includes(makeId))
        filterMakeIds = filterMakeIds.filter(f => f !== makeId)
      else
        filterMakeIds = filterMakeIds.concat([makeId])

      // remove filter models that are outside the bounds of the selected make filters
      let filterModelIds = (prev.carModelId || [])
      if (filterModelIds.length && filterMakeIds.length) {
        filterModelIds = allModels
          .filter(m => filterModelIds.includes(m.id) && filterMakeIds.includes(m.carMakeId))
          .map(m => m.id)
      }

      return {
        ...prev,
        carMakeId: filterMakeIds,
        carModelId: filterModelIds
      }
    })
  }, [allModels])

  const columns = React.useMemo(() => columnsFactory({
    onToggleFilterOption: (columnKey: CarDetailFilterablePropKeys, optionKey: CarDetailFilterOptionKey) => {
      if (columnKey === 'carMakeId') {
        // use special toggler to avoid erroneous cascading state
        toggleSelectedFilterMake(optionKey as string)
      } else {
        // use generic toggler
        setSelectedFilterOptions(prev => {
          let filterValues = prev[columnKey] || []
          
          // toggle logic
          if (filterValues.includes(optionKey)) 
            filterValues = filterValues.filter(ek => ek !== optionKey)
          else 
            filterValues = filterValues.concat([optionKey])
  
          return { ...prev, [columnKey]: filterValues }
        })
      }
    },
    filterOptions,
    selectedFilterOptions
  }), [filterOptions, selectedFilterOptions, toggleSelectedFilterMake])

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
  filterOptions: Record<
    CarDetailFilterablePropKeys,
    DataGridListFilterOption<CarDetailFilterOptionKey>[]
  >
  selectedFilterOptions: Record<
    CarDetailFilterablePropKeys,
    CarDetailFilterOptionKey[]
  >
}

function columnsFactory({ onToggleFilterOption, filterOptions, selectedFilterOptions }: ColumnsFactoryProps): Column<CarDetail>[] {
  // header renderer factory that shows a filter icon and a popover with options
  const renderHeader = (columnKey: CarDetailFilterablePropKeys, columnName: string) => {
    const renderer = (renderProps: RenderHeaderCellProps<CarDetail>) => {
      const opts = filterOptions[columnKey] ?? []
      const selOpts = selectedFilterOptions[columnKey] ?? []
  
      return (
        <DataGridListFilter
          filterTitle={columnName}
          labelRenderer={() => renderHeaderCell(renderProps)}
          options={opts}
          selectedOptions={selOpts}
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
