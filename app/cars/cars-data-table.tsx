'use client'

import { useQuery } from '@apollo/client/react'
import { RefreshCw, Trash2, TriangleAlert } from 'lucide-react'
import React, { MouseEvent } from 'react'
import { DataGrid, RenderCheckboxProps } from 'react-data-grid'
import { toast } from 'sonner'

import useCarDataApiClient from '@/api-clients/car-data-api-client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox, CheckboxChangeHandler } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { GET_CAR_DETAILS, GET_CAR_FEATURES, GET_CAR_MAKES, GET_CAR_MODELS } from '@/graphql/operations'
import { useConfirmationDialog } from '@/lib/hooks'
import { CarDetail } from '@/types/car-detail'
import { columnsFactory } from './cars-data-table-columns'
import { filterCarsDataTableRows, provideListFilterOptions } from './cars-data-table-logic'
import { CarDetailFilterablePropKeys, CarDetailFilterOptionKey } from './cars-data-table-types'
import { DataGridListFilterOption } from './data-grid-list-filter'
import { DataGridNumberRangeFilterValues } from './data-grid-number-range-filter'

export default function CarsDataTable() {
  const dataClient = useCarDataApiClient()
  const { loading: loadingMakes, error: makesLoadingError, data: allMakes } = useQuery(GET_CAR_MAKES)
  const { loading: loadingModels, error: modelsLoadingError, data: allModels } = useQuery(GET_CAR_MODELS)
  const { loading: loadingFeatures, error: featuresLoadingError, data: allFeatures } = useQuery(GET_CAR_FEATURES)
  const { loading: loadingCarDetails, error: carDetailsLoadingError, data: rows } = useQuery(GET_CAR_DETAILS)
  const loadingAnyData = loadingMakes || loadingModels || loadingFeatures || loadingCarDetails
  const anyLoadingError = !!(makesLoadingError || modelsLoadingError || featuresLoadingError || carDetailsLoadingError)

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

  // prefetch options for known columns (makeId, modelId, year)
  const listFilterOptions = React.useMemo<
    Record<CarDetailFilterablePropKeys, DataGridListFilterOption<CarDetailFilterOptionKey>[]>
  >(
    () =>
      provideListFilterOptions(
        allMakes?.carMakes || [],
        allModels?.carModels || [],
        allFeatures?.carFeatures || [],
        rows?.carDetails || [],
        selectedListFilterOptions
      ),
    [allMakes, allModels, allFeatures, rows, selectedListFilterOptions]
  )

  // apply basic client-side filters
  const filteredRows = React.useMemo(
    () => filterCarsDataTableRows(rows?.carDetails || [], selectedListFilterOptions, yearRangeFilter),
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
          filterModelIds = (allModels?.carModels || [])
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
        body: 'Are you sure you want to delete the selected car(s)?',
      })
      if (dialogResult === 'confirm') {
        const selectedIds = selectedRows.values().toArray()
        try {
          const result = await dataClient.deleteCarDetails(selectedIds)
          if (result === 0) {
            toast.error('No cars were deleted!', {
              description: 'Failed to delete the selected car(s).',
            })
          } else if (result !== selectedIds.length) {
            toast.warning('Warning', {
              description: `Only ${result} of the ${selectedIds.length} cars were deleted.`,
            })
            setSelectedRows(new Set())
          } else {
            toast.success('Success!', {
              description:
                selectedIds.length === 1
                  ? 'The selected car was deleted.'
                  : `All ${result} selected cars were deleted.`,
            })
            setSelectedRows(new Set())
          }

          // await fetchCarDetails()
        } catch {
          toast.error('An error occurred!', {
            description: 'Failed to delete the selected car(s).',
          })
        }
      }
    }
  }

  if (loadingAnyData) {
    return (
      <div className="container mx-auto space-y-8 py-10">
        <div className="flex justify-end gap-4">
          <Skeleton className="w-[150px] h-[36px]" />
        </div>
        <Skeleton className="w-full h-[350px]" />
      </div>
    )
  }

  if (anyLoadingError) {
    return (
      <div className="container m-auto">
        <DataLoadErrorAlert />
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-8 py-10">
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

function DataLoadErrorAlert() {
  return (
    <Alert variant="destructive">
      <AlertTitle>
        <div className="flex gap-2 items-center">
          <TriangleAlert /> <span>An Error Occurred</span>
        </div>
      </AlertTitle>
      <AlertDescription className="pl-8">
        <div className="w-full">
          We couldn&apos;t fetch the data needed for this page. Click Retry to reload the page.
        </div>
        <div className="w-full flex justify-center">
          <Button
            variant="link"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw /> Retry
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}