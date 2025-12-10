'use client'

import { Trash2 } from 'lucide-react'
import React, { MouseEvent } from 'react'
import { DataGrid, RenderCheckboxProps } from 'react-data-grid'
import { toast } from 'sonner'

import useCarDataApiClient from '@/api-clients/car-data-api-client'
import { Button } from '@/components/ui/button'
import { Checkbox, CheckboxChangeHandler } from '@/components/ui/checkbox'
import { useConfirmationDialog } from '@/lib/hooks'
import { CarDetail } from '@/types/car-detail'
import { CarFeature } from '@/types/car-feature'
import { CarMake } from '@/types/car-make'
import { CarModel } from '@/types/car-model'
import { columnsFactory } from './cars-data-table-columns'
import { filterCarsDataTableRows, provideListFilterOptions } from './cars-data-table-logic'
import { CarDetailFilterablePropKeys, CarDetailFilterOptionKey } from './cars-data-table-types'
import { DataGridListFilterOption } from './data-grid-list-filter'
import { DataGridNumberRangeFilterValues } from './data-grid-number-range-filter'

export default function CarsDataTable() {
  const dataClient = useCarDataApiClient()
  const [allMakes, setAllMakes] = React.useState<CarMake[]>([])
  const [allModels, setAllModels] = React.useState<CarModel[]>([])
  const [allFeatures, setAllFeatures] = React.useState<CarFeature[]>([])
  const [rows, setRows] = React.useState<CarDetail[]>([])
  const [selectedRows, setSelectedRows] = React.useState<ReadonlySet<string>>(new Set<string>())
  const [selectedListFilterOptions, setSelectedListFilterOptions] = React.useState<
    Record<CarDetailFilterablePropKeys, CarDetailFilterOptionKey[]>
  >({
    carMakeId: [],
    carModelId: [],
    CarDetailFeatures: [],
  })
  const [yearRangeFilter, setYearRangeFilter] = React.useState<DataGridNumberRangeFilterValues>({})
  const { showDialog: showConfirmationDialog } = useConfirmationDialog()

  React.useEffect(() => {
    async function fetchCarMakes() {
      const data = await dataClient.getCarMakes()
      setAllMakes(data)
    }

    fetchCarMakes()
  })

  React.useEffect(() => {
    async function fetchCarModels() {
      const data = await dataClient.getCarModels()
      setAllModels(data)
    }

    fetchCarModels()
  })

  React.useEffect(() => {
    async function fetchCarFeatures() {
      const data = await dataClient.getCarFeatures()
      setAllFeatures(data)
    }

    fetchCarFeatures()
  })

  const fetchCarDetails = React.useCallback(async () => {
    const data = await dataClient.getCarDetails()
    setRows(data)
  }, [dataClient])

  // load cars on first render
  React.useEffect(() => {
    fetchCarDetails()
  }, [fetchCarDetails])

  // prefetch options for known columns (makeId, modelId, year)
  const listFilterOptions = React.useMemo<
    Record<CarDetailFilterablePropKeys, DataGridListFilterOption<CarDetailFilterOptionKey>[]>
  >(
    () => provideListFilterOptions(allMakes, allModels, allFeatures, rows, selectedListFilterOptions),
    [allMakes, allModels, allFeatures, rows, selectedListFilterOptions]
  )

  // apply basic client-side filters
  const filteredRows = React.useMemo(
    () => filterCarsDataTableRows(rows, selectedListFilterOptions, yearRangeFilter),
    [rows, selectedListFilterOptions, yearRangeFilter]
  )

  const toggleSelectedFilterMake = React.useCallback(
    (makeId: string) => {
      setSelectedListFilterOptions(prev => {
        let filterMakeIds = prev.carMakeId || []

        if (filterMakeIds.includes(makeId)) filterMakeIds = filterMakeIds.filter(f => f !== makeId)
        else filterMakeIds = filterMakeIds.concat([makeId])

        // remove filter models that are outside the bounds of the selected make filters
        let filterModelIds = prev.carModelId || []
        if (filterModelIds.length && filterMakeIds.length) {
          filterModelIds = allModels
            .filter(m => filterModelIds.includes(m.id) && filterMakeIds.includes(m.carMakeId))
            .map(m => m.id)
        }

        return {
          ...prev,
          carMakeId: filterMakeIds,
          carModelId: filterModelIds,
        }
      })
    },
    [allModels]
  )

  const columns = React.useMemo(
    () =>
      columnsFactory({
        onToggleFilterOption: (columnKey: CarDetailFilterablePropKeys, optionKey: CarDetailFilterOptionKey) => {
          if (columnKey === 'carMakeId') {
            // use special toggler to avoid erroneous cascading state
            toggleSelectedFilterMake(optionKey as string)
          } else {
            // use generic toggler
            setSelectedListFilterOptions(prev => {
              let filterValues = prev[columnKey] || []

              // toggle logic
              if (filterValues.includes(optionKey)) filterValues = filterValues.filter(ek => ek !== optionKey)
              else filterValues = filterValues.concat([optionKey])

              return { ...prev, [columnKey]: filterValues }
            })
          }
        },
        listFilterOptions,
        selectedListFilterOptions,
        yearRangeFilter,
        onYearRangeFilterChange: rangeValues => setYearRangeFilter(rangeValues),
      }),
    [listFilterOptions, selectedListFilterOptions, toggleSelectedFilterMake, yearRangeFilter]
  )

  const handleDeleteSelected = async () => {
    if (selectedRows?.size) {
      const dialogResult = await showConfirmationDialog({
        title: 'Confirm Delete',
        body: 'Are you sure you want to delete the selected car(s)?'
      })
      if (dialogResult === 'confirm') {
        const selectedIds = selectedRows.values().toArray()
        try {
          const result = await dataClient.deleteCarDetails(selectedIds)
          if (result === 0) {
            toast.error('No cars were deleted!', {
              description: 'Failed to delete the selected car(s).'
            })
          } else if (result !== selectedIds.length) {
            toast.warning('Warning', {
              description: `Only ${result} of the ${selectedIds.length} cars were deleted.`
            })
            setSelectedRows(new Set())
          } else {
            toast.success('Success!', {
              description: selectedIds.length === 1 ? 'The selected car was deleted.' : `All ${result} selected cars were deleted.`
            })
            setSelectedRows(new Set())
          }
  
          await fetchCarDetails()
        } catch {
          toast.error('An error occurred!', {
            description: 'Failed to delete the selected car(s).'
          })
        }
      }
    }
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-end gap-4">
        <Button
          variant="destructive"
          aria-label="Delete Selected Cars"
          onClick={handleDeleteSelected}
          disabled={!selectedRows?.size}
        >
          <Trash2 className="size-4" /> Delete Selected
        </Button>
      </div>
      <DataGrid
        columns={columns}
        rows={filteredRows}
        rowKeyGetter={carRowKeyGetter}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
        renderers={{
          renderCheckbox: DataTableCheckbox,
        }}
      />
    </div>
  )
}

function carRowKeyGetter(row: CarDetail) {
  return row.id
}

// custom renderer to use ShadCN's checkbox in the data-grid
function DataTableCheckbox(props: RenderCheckboxProps) {
  const { onChange, indeterminate, checked, ...commonProps } = props

  const changeHandler = React.useCallback<CheckboxChangeHandler>(
    (event, checkedState) => {
      const shift = (event.nativeEvent as unknown as MouseEvent<HTMLInputElement>).shiftKey
      onChange(checkedState === true, shift)
    },
    [onChange]
  )

  return (
    <Checkbox checked={indeterminate ? 'indeterminate' : checked} onCheckedChange={changeHandler} {...commonProps} />
  )
}
