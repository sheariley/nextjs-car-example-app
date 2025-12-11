'use client'

import { useMutation, useQuery } from '@apollo/client/react'
import { Trash2 } from 'lucide-react'
import React, { MouseEvent } from 'react'
import { DataGrid, RenderCheckboxProps, SortColumn } from 'react-data-grid'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox, CheckboxChangeHandler } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { SortDirection } from '@/graphql/generated/client/graphql'
import {
  DELETE_CAR_DETAILS,
  GET_CAR_DETAILS,
  GET_CAR_FEATURES,
  GET_CAR_MAKES,
  GET_CAR_MODELS,
} from '@/graphql/operations'
import { isTruthy } from '@/lib/functional'
import { useConfirmationDialog } from '@/lib/hooks'
import {
  carDataGridUIActions,
  carDataGridUISelectors,
  NumberRangeFilterValues,
  useAppDispatch,
  useAppSelector,
} from '@/lib/store'
import { CarDetail } from '@/types/car-detail'
import { DataLoadErrorAlert } from './cars-data-load-error-alert'
import { columnsFactory } from './cars-data-table-columns'
import { CarDataTablePager } from './cars-data-table-pager'

const TOAST_ID_DELETING_CAR = 'deleting-car'

export default function CarsDataTable() {
  const dispatch = useAppDispatch()
  const { loading: loadingMakes, error: makesLoadingError, data: allMakes } = useQuery(GET_CAR_MAKES)
  const { loading: loadingModels, error: modelsLoadingError, data: allModels } = useQuery(GET_CAR_MODELS)
  const { loading: loadingFeatures, error: featuresLoadingError, data: allFeatures } = useQuery(GET_CAR_FEATURES)

  const { showDialog: showConfirmationDialog } = useConfirmationDialog()
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

  // filter state
  const makeFilterValues = useAppSelector(carDataGridUISelectors.selectMakeFilterValues)
  const modelFilterValues = useAppSelector(carDataGridUISelectors.selectModelFilterValues)
  const featureFilterValues = useAppSelector(carDataGridUISelectors.selectFeatureFilterValues)
  const yearRangeFilterValues = useAppSelector(carDataGridUISelectors.selectYearRangeFilter)
  const setYearRangeFilter = React.useCallback(
    (values: NumberRangeFilterValues) => dispatch(carDataGridUIActions.setYearRangeFilter(values)),
    [dispatch]
  )

  // pagination state
  const page = useAppSelector(carDataGridUISelectors.selectPage)
  const pageSize = useAppSelector(carDataGridUISelectors.selectPageSize)
  const totalResultCount = useAppSelector(carDataGridUISelectors.selectTotalResultCount)
  const setTotalResultCount = React.useCallback(
    (value: number) => dispatch(carDataGridUIActions.setTotalResultCount(value)),
    [dispatch]
  )

  // sorting state
  const [sortColumns, setSortColumns] = React.useState<SortColumn[]>([])

  // map local filter options to GraphQL filter input variables
  const requestFilter = useAppSelector(carDataGridUISelectors.selectRequestFilter)

  // server query for fetching car details
  const {
    loading: loadingCarDetails,
    error: carDetailsLoadingError,
    data: carDetailData,
  } = useQuery(GET_CAR_DETAILS, {
    variables: {
      page,
      pageSize,
      filter: requestFilter,
      sort:
        sortColumns.length > 0
          ? sortColumns.map(({ columnKey, direction }) => ({
              col: columnKey,
              dir: direction as SortDirection,
            }))
          : undefined,
    },
  })

  // keep result count in sync with data from server
  React.useEffect(() => {
    const { carDetails: { totalCount: newTotal } = {} } = carDetailData || {}
    if (typeof newTotal !== 'undefined') {
      if (newTotal !== totalResultCount) setTotalResultCount(newTotal)
    }
  }, [carDetailData, totalResultCount, setTotalResultCount])

  // catch-alls for loading and error states
  const loadingAnyData = loadingMakes || loadingModels || loadingFeatures || loadingCarDetails
  const anyLoadingError = !!(makesLoadingError || modelsLoadingError || featuresLoadingError || carDetailsLoadingError)

  const featureFilterOptions = React.useMemo(() => {
    if (!allFeatures) return []
    return allFeatures.carFeatures.map(mapFilterListOption)
  }, [allFeatures])

  const makeFilterOptions = React.useMemo(() => {
    if (!allMakes) return []
    return allMakes.carMakes.map(mapFilterListOption)
  }, [allMakes])

  const modelFilterOptions = React.useMemo(() => {
    if (!allModels) return []

    if (!allMakes) return allModels.carModels.map(mapFilterListOption) // return unfiltered

    // filter options based on selected makes
    const filteredModels = !makeFilterValues.length
      ? allModels.carModels
      : allModels.carModels.filter(m => makeFilterValues.includes(m.carMakeId))

    return filteredModels.map(mapFilterListOption)
  }, [allMakes, allModels, makeFilterValues])

  const columns = React.useMemo(
    () =>
      columnsFactory({
        makeFilterOptions,
        makeFilterValues,
        modelFilterOptions,
        modelFilterValues,
        featureFilterOptions,
        featureFilterValues,
        onToggleMakeFilter: makeId =>
          dispatch(carDataGridUIActions.toggleSelectedCarMakeFilter({ allModels: allModels?.carModels || [], makeId })),
        onToggleModelFilter: modelId => dispatch(carDataGridUIActions.toggleSelectedCarModelFilter(modelId)),
        onToggleFeatureFilter: featureId => dispatch(carDataGridUIActions.toggleSelectedCarFeatureFilter(featureId)),
        yearRangeFilterValues,
        onYearRangeFilterChange: rangeValues => setYearRangeFilter(rangeValues),
      }),
    [
      allModels,
      featureFilterOptions,
      makeFilterOptions,
      modelFilterOptions,
      makeFilterValues,
      modelFilterValues,
      featureFilterValues,
      yearRangeFilterValues,
      setYearRangeFilter,
      dispatch,
    ]
  )

  const handleDeleteSelected = async () => {
    if (selectedRows?.size) {
      const dialogResult = await showConfirmationDialog({
        title: 'Confirm Delete',
        body: 'Are you sure you want to delete the selected car(s)?',
      })
      if (dialogResult === 'confirm') {
        const selectedIds = selectedRows.values().toArray()
        toast.loading(`Attempting to delete ${selectedIds.length} cars...`, { id: TOAST_ID_DELETING_CAR })
        try {
          const result = await deleteCarDetails({ variables: { ids: selectedIds } })
          toast.dismiss(TOAST_ID_DELETING_CAR)
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
          toast.dismiss(TOAST_ID_DELETING_CAR)
        }
      }
    }
  }

  return (
    <div className="container mx-auto space-y-6 py-10">
      {/* Action Buttons */}
      <div className="flex justify-start gap-4">
        <Button
          variant="destructive"
          aria-label="Delete Selected Cars"
          onClick={handleDeleteSelected}
          disabled={!selectedRows?.size || deletingCarDetails || loadingAnyData}
        >
          <Trash2 className="size-4" /> Delete Selected
        </Button>
      </div>

      {/* Data Grid */}
      {loadingCarDetails ? (
        <Skeleton className="h-[350px] w-full" />
      ) : anyLoadingError ? (
        <div className="container m-auto">
          <DataLoadErrorAlert />
        </div>
      ) : (
        <DataGrid
          columns={columns}
          rows={(carDetailData?.carDetails?.items as CarDetail[]) || []}
          rowKeyGetter={carRowKeyGetter}
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
          sortColumns={sortColumns}
          onSortColumnsChange={setSortColumns}
          renderers={{
            renderCheckbox: ({ disabled, ...props }) => (
              <DataTableCheckbox disabled={disabled || deletingCarDetails} {...props} />
            ),
          }}
        />
      )}

      {/* Paging */}
      <CarDataTablePager loading={loadingAnyData} />
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

function mapFilterListOption(item: { id: string; name: string }) {
  return {
    key: item.id,
    label: item.name,
  }
}
