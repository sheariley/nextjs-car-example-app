'use client'

import { useMutation, useQuery } from '@apollo/client/react'
import { FilterXIcon, PlusSquare, Trash2 } from 'lucide-react'
import Link from 'next/link'
import React, { MouseEvent } from 'react'
import { DataGrid, RenderCheckboxProps, RowsChangeData, SortColumn } from 'react-data-grid'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox, CheckboxChangeHandler } from '@/components/ui/checkbox'
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Spinner } from '@/components/ui/spinner'
import { SortDirection } from '@/graphql/generated/client/graphql'
import { DELETE_CAR_DETAILS, GET_CAR_DETAILS, GET_CAR_FEATURES, GET_CAR_MAKES, GET_CAR_MODELS, UPDATE_CAR_DETAILS } from '@/graphql/operations'
import { isTruthy } from '@/lib/functional'
import { useConfirmationDialog } from '@/lib/hooks'
import { carDataGridUIActions, carDataGridUISelectors, useAppDispatch, useAppSelector } from '@/lib/store'
import { CarDetail, CarDetailUpdateInput } from '@/types/car-detail'
import { DataLoadErrorAlert } from './cars-data-load-error-alert'
import { columnsFactory } from './cars-data-table-columns'
import { CarDataTablePager } from './cars-data-table-pager'

const TOAST_ID_DELETING_CAR = 'deleting-car'

export default function CarsDataTable() {
  const dispatch = useAppDispatch()
  const { loading: loadingMakes, error: makesLoadingError, data: allMakes } = useQuery(GET_CAR_MAKES)
  const { loading: loadingModels, error: modelsLoadingError, data: allModels } = useQuery(GET_CAR_MODELS)
  const { loading: loadingFeatures, error: featuresLoadError, data: allFeatures } = useQuery(GET_CAR_FEATURES)
  const [updateCarDetails, { loading: updatingCarDetails }] = useMutation(UPDATE_CAR_DETAILS)

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
  const [displayedRows, setDisplayedRows] = React.useState<CarDetail[]>([])

  // smart-sync between carDetailData and displayedRows to avoid excessive UI flashing
  React.useEffect(() => {
    if (!loadingCarDetails) {
      setDisplayedRows(carDetailData?.carDetails.items ?? [])
    }
  }, [carDetailData, loadingCarDetails])

  // keep result total-count in sync with data from server
  React.useEffect(() => {
    const { carDetails: { totalCount: newTotal } = {} } = carDetailData || {}
    if (typeof newTotal !== 'undefined') {
      if (newTotal !== totalResultCount) setTotalResultCount(newTotal)
    }
  }, [carDetailData, totalResultCount, setTotalResultCount])

  // catch-alls for loading and error states
  const loadingAnyData = loadingMakes || loadingModels || loadingFeatures || loadingCarDetails
  const anyLoadingError = !!(makesLoadingError || modelsLoadingError || featuresLoadError || carDetailsLoadingError)

  const columns = React.useMemo(
    () =>
      columnsFactory({
        allMakes: allMakes?.carMakes || [],
        allModels: allModels?.carModels || [],
        allFeatures: allFeatures?.carFeatures || []
      }),
    [allModels, allMakes, allFeatures]
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

  const handleClearFilters = () => {
    dispatch(carDataGridUIActions.clearAllFilters())
    setSelectedRows(new Set())
    setSortColumns([])
  }

  const indicateSaveError = () => {
    toast.error('An error occurred', { description: 'Failed to save changes.' })
  }

  const handleRowsChange = async (rows: CarDetail[], changeData: RowsChangeData<CarDetail>) => {
    const changedRows = rows.filter((_, idx) => changeData.indexes.includes(idx))
    const updateInputs = changedRows.map(x => ({
      id: x.id,
      carMakeId: x.carMakeId,
      carModelId: x.carModelId,
      year: x.year,
      featureIds: x.CarDetailFeatures?.map(f => f.featureId)
    } as CarDetailUpdateInput))

    try {
      const results = await updateCarDetails({ variables: { input: updateInputs } })
      if (results.error) {
        indicateSaveError()
      } else {
        const updatedRows = displayedRows.map(r => {
          const inUpdateResult = results.data?.updateCarDetails?.find(x => x.id === r.id)
          return inUpdateResult ?? r
        })
        setDisplayedRows(updatedRows)
        toast.success('Car(s) saved!', { description: 'The car was saved successfully!' })
      }
    } catch {
      indicateSaveError()
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
        <Button asChild aria-label="Add a Car">
          <Link href="/cars/new">
            <PlusSquare className="size-4" /> Add Car
          </Link>
        </Button>
        <Button
          className="ml-auto justify-self-end"
          variant="secondary"
          aria-label="Clear Filters"
          onClick={handleClearFilters}
        >
          <FilterXIcon className="size-4" /> Clear Filters
        </Button>
      </div>

      {/* Data Grid */}
      {anyLoadingError ? (
        <div className="container m-auto">
          <DataLoadErrorAlert />
        </div>
      ) : (
        <div className="relative">
          <DataGrid
            columns={columns}
            rows={displayedRows}
            rowKeyGetter={carRowKeyGetter}
            selectedRows={selectedRows}
            onSelectedRowsChange={setSelectedRows}
            isRowSelectionDisabled={() => deletingCarDetails || loadingAnyData}
            sortColumns={sortColumns}
            onSortColumnsChange={setSortColumns}
            onRowsChange={handleRowsChange}
            renderers={{
              renderCheckbox: ({ disabled, ...props }) => (
                <DataTableCheckbox disabled={disabled || deletingCarDetails} {...props} />
              ),
            }}
          />
          {(loadingCarDetails || deletingCarDetails || updatingCarDetails) && (
            <div className="bg-muted/60 absolute inset-0 z-10 flex flex-col items-center justify-center [--radius:1rem]">
              <Item variant="outline" className="bg-background">
                <ItemMedia>
                  <Spinner />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="line-clamp-1">Loading...</ItemTitle>
                </ItemContent>
              </Item>
            </div>
          )}
        </div>
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
