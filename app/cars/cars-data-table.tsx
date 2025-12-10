'use client'

import { useMutation, useQuery } from '@apollo/client/react'
import { RefreshCw, Trash2, TriangleAlert } from 'lucide-react'
import React, { MouseEvent } from 'react'
import { DataGrid, RenderCheckboxProps } from 'react-data-grid'
import { toast } from 'sonner'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox, CheckboxChangeHandler } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { CarDetailFilterInput } from '@/graphql/generated/client/graphql'
import {
  DELETE_CAR_DETAILS,
  GET_CAR_DETAILS,
  GET_CAR_FEATURES,
  GET_CAR_MAKES,
  GET_CAR_MODELS,
} from '@/graphql/operations'
import { isTruthy } from '@/lib/functional'
import { useConfirmationDialog } from '@/lib/hooks'
import { CarDetail } from '@/types/car-detail'
import { columnsFactory } from './cars-data-table-columns'
import { provideListFilterOptions } from './cars-data-table-logic'
import { CarDetailFilterablePropKeys } from './cars-data-table-types'
import { DataGridListFilterOption } from './data-grid-list-filter'
import { DataGridNumberRangeFilterValues } from './data-grid-number-range-filter'

export default function CarsDataTable() {
  const { loading: loadingMakes, error: makesLoadingError, data: allMakes } = useQuery(GET_CAR_MAKES)
  const { loading: loadingModels, error: modelsLoadingError, data: allModels } = useQuery(GET_CAR_MODELS)
  const { loading: loadingFeatures, error: featuresLoadingError, data: allFeatures } = useQuery(GET_CAR_FEATURES)

  const [deleteCarDetails, { loading: deletingCarDetails }] = useMutation(DELETE_CAR_DETAILS, {
    update(cache, result) {
      if (result.data?.deleteCarDetails === selectedRows.size) {
        const normalizedIds = selectedRows
          .values()
          .toArray()
          .map(id => cache.identify({ id, __typename: 'CarDetail' }))
          .filter(isTruthy) as string[]
        normalizedIds.forEach(id => cache.evict({ id }))
        cache.gc()
      }
    },
  })

  const [selectedRows, setSelectedRows] = React.useState<ReadonlySet<string>>(new Set<string>())
  const [selectedListFilterOptions, setSelectedListFilterOptions] = React.useState<
    Record<CarDetailFilterablePropKeys, string[]>
  >({
    carMakeId: [],
    carModelId: [],
    CarDetailFeatures: [],
  })
  const [yearRangeFilter, setYearRangeFilter] = React.useState<DataGridNumberRangeFilterValues>({})
  const { showDialog: showConfirmationDialog } = useConfirmationDialog()

  // pagination state (server-side)
  const [page, setPage] = React.useState<number>(1)
  const [pageSize, setPageSize] = React.useState<number>(20)

  // reset page to 1 when any filter changes
  React.useEffect(() => {
    setPage(1)
  }, [selectedListFilterOptions, yearRangeFilter])

  // map local filter options to GraphQL filter input variables
  const requestFilter = React.useMemo(() => {
    const filterInput: CarDetailFilterInput = {}

    filterInput.carMakeIds = selectedListFilterOptions.carMakeId.length ? selectedListFilterOptions.carMakeId : undefined
    filterInput.carModelIds = selectedListFilterOptions.carModelId.length ? selectedListFilterOptions.carModelId : undefined
    filterInput.featureIds = selectedListFilterOptions?.CarDetailFeatures

    if (yearRangeFilter) {
      if (yearRangeFilter.min != null) filterInput.yearMin = yearRangeFilter.min
      if (yearRangeFilter.max != null) filterInput.yearMax = yearRangeFilter.max
    }

    return Object.keys(filterInput).length ? filterInput : undefined
  }, [selectedListFilterOptions, yearRangeFilter])

  // server query for car details
  const {
    loading: loadingCarDetails,
    error: carDetailsLoadingError,
    data: carDetailData,
  } = useQuery(GET_CAR_DETAILS, {
    variables: { page, pageSize, filter: requestFilter },
  })

  // catch-alls for loading and error states
  const loadingAnyData = loadingMakes || loadingModels || loadingFeatures || loadingCarDetails
  const anyLoadingError = !!(makesLoadingError || modelsLoadingError || featuresLoadingError || carDetailsLoadingError)

  // prefetch options for known columns (makeId, modelId, year)
  const listFilterOptions = React.useMemo<
    Record<CarDetailFilterablePropKeys, DataGridListFilterOption<string>[]>
  >(
    () =>
      provideListFilterOptions(
        allMakes?.carMakes || [],
        allModels?.carModels || [],
        allFeatures?.carFeatures || [],
        carDetailData?.carDetails?.items || [],
        selectedListFilterOptions
      ),
    [allMakes, allModels, allFeatures, carDetailData, selectedListFilterOptions]
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
        onToggleFilterOption: (columnKey: CarDetailFilterablePropKeys, optionKey: string) => {
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
        const loadingToastId = toast.loading(`Attempting to delete ${selectedIds.length} cars...`)
        try {
          const result = await deleteCarDetails({ variables: { ids: selectedIds } })
          toast.dismiss(loadingToastId)
          const deletedCount = result.data?.deleteCarDetails
          if (deletedCount === 0) {
            toast.error('No cars were deleted!', {
              description: 'Failed to delete the selected car(s).',
            })
          } else if (deletedCount !== selectedIds.length) {
            toast.warning('Warning', {
              description: `Only ${deletedCount} of the ${selectedIds.length} cars were deleted.`,
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
        } catch {
          toast.error('An error occurred!', {
            description: 'Failed to delete the selected car(s).',
          })
        } finally {
          if (toast.getToasts().some(x => x.id === loadingToastId)) toast.dismiss(loadingToastId)
        }
      }
    }
  }

  if (loadingAnyData) {
    return (
      <div className="container mx-auto space-y-8 py-10">
        <div className="flex justify-end gap-4">
          <Skeleton className="h-[36px] w-[150px]" />
        </div>
        <Skeleton className="h-[350px] w-full" />
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
    <div className="container mx-auto space-y-6 py-10">
      <div className="flex justify-start gap-4">
        <Button
          variant="destructive"
          aria-label="Delete Selected Cars"
          onClick={handleDeleteSelected}
          disabled={!selectedRows?.size || deletingCarDetails}
        >
          <Trash2 className="size-4" /> Delete Selected
        </Button>
      </div>
      <DataGrid
        columns={columns}
        rows={carDetailData?.carDetails?.items as CarDetail[] || []}
        rowKeyGetter={carRowKeyGetter}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
        renderers={{
          renderCheckbox: ({ disabled, ...props }) => (
            <DataTableCheckbox disabled={disabled || deletingCarDetails} {...props} />
          ),
        }}
      />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))}>
          Prev
        </Button>
        <div className="px-2">Page {page}</div>
        <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)}>
          Next
        </Button>
        <select
          value={pageSize}
          onChange={e => {
            const v = Number(e.target.value) || 20
            setPageSize(Math.min(100, Math.max(1, v)))
            setPage(1)
          }}
          className="ml-2 rounded border px-2 py-1 text-sm"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
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
        <div className="flex items-center gap-2">
          <TriangleAlert /> <span>An Error Occurred</span>
        </div>
      </AlertTitle>
      <AlertDescription className="pl-8">
        <div className="w-full">
          We couldn&apos;t fetch the data needed for this page. Click Retry to reload the page.
        </div>
        <div className="flex w-full justify-center">
          <Button variant="link" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw /> Retry
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
