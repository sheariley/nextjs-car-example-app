import { useLazyQuery } from '@apollo/client/react'
import { ArrowRightCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { Column, renderHeaderCell, RenderHeaderCellProps, SelectColumn } from 'react-data-grid'

import { DataGridListFilterColumnHeader } from '@/components/data-grid/data-grid-list-filter-column-header'
import { DataGridNumberRangeFilterColumnHeader } from '@/components/data-grid/data-grid-number-range-filter-column-header'
import { DataGridSimpleInputCellEditor } from '@/components/data-grid/data-grid-simple-input-cell-editor'
import { Button } from '@/components/ui/button'
import {
  carDataGridUIActions,
  carDataGridUISelectors,
  NumberRangeFilterValues,
  useAppDispatch,
  useAppSelector,
} from '@/lib/store'

import { Spinner } from '@/components/ui/spinner'
import { GET_CAR_FEATURES } from '@/graphql/operations'
import { CarDetail } from '@/types/car-detail'
import { CarMake } from '@/types/car-make'
import { CarModel } from '@/types/car-model'
import { DataGridDropdownCellEditor } from '@/components/data-grid/data-grid-dropdown-cell-editor'

export type ColumnsFactoryProps = {
  allMakes: CarMake[]
  allModels: CarModel[]
}

export function columnsFactory({ allMakes, allModels }: ColumnsFactoryProps): Column<CarDetail>[] {
  return [
    SelectColumn,
    {
      name: 'Model',
      key: 'CarModel',
      sortable: true,
      editable: true,
      renderCell: props => (
        <Button asChild variant="link" className="flex w-full justify-between" title="View Details">
          <Link href={`/cars/${props.row.id}`}>
            {props.row.CarModel?.name} <ArrowRightCircle />
          </Link>
        </Button>
      ),
      renderHeaderCell: cellHeaderProps => <CarModelColumnHeader allModels={allModels} {...cellHeaderProps} />,
    },
    {
      name: 'Make',
      key: 'CarMake',
      sortable: true,
      editable: true,
      renderCell: props => props.row.CarMake?.name,
      renderHeaderCell: cellHeaderProps => (
        <CarMakeColumnHeader allModels={allModels} allMakes={allMakes} {...cellHeaderProps} />
      ),
      renderEditCell: editorProps => (
        <DataGridDropdownCellEditor
          options={allMakes.map(mapCellEditorListOption)}
          multiple={false}
          valueRenderer={value => allMakes.find(m => m.id === value)?.name ?? ''}
          valueGetter={row => row.carMakeId}
          valueSetter={(value, row) => ({...row, carMakeId: value})}
          {...editorProps}
        />
      ),
    },
    {
      name: 'Year',
      key: 'year',
      sortable: true,
      editable: true,
      renderHeaderCell: cellHeaderProps => <YearColumnHeader {...cellHeaderProps} />,
      renderEditCell: editorProps => <DataGridSimpleInputCellEditor type="number" {...editorProps} />,
    },
    {
      name: 'Features',
      key: 'CarDetailFeatures',
      sortable: false,
      renderCell: props => {
        const cellText = !props.row.CarDetailFeatures?.length
          ? 'None'
          : props.row.CarDetailFeatures?.map(df => df.CarFeature!.name).join(', ')
        return (
          <span className="inline-block max-w-[200px] truncate" title={cellText}>
            {cellText}
          </span>
        )
      },
      renderHeaderCell: cellHeaderProps => <CarFeatureColumnHeader {...cellHeaderProps} />,
    },
  ]
}

function CarModelColumnHeader({
  allModels,
  ...cellHeaderProps
}: RenderHeaderCellProps<CarDetail> & { allModels: CarModel[] }) {
  const dispatch = useAppDispatch()
  const selectedValues = useAppSelector(carDataGridUISelectors.selectModelFilterValues)
  const makeFilterValues = useAppSelector(carDataGridUISelectors.selectMakeFilterValues)
  const filteredModels = !makeFilterValues.length
    ? allModels
    : allModels.filter(m => makeFilterValues.includes(m.carMakeId))
  const filterOptions = filteredModels.map(mapFilterListOption)

  const onFilterChange = (values: string[]) => dispatch(carDataGridUIActions.setModelFilterValues(values))

  return (
    <DataGridListFilterColumnHeader
      filterTitle="Model"
      labelRenderer={() => renderHeaderCell(cellHeaderProps)}
      options={filterOptions}
      selectedOptions={selectedValues}
      onFilterChange={onFilterChange}
    />
  )
}

function CarMakeColumnHeader({
  allMakes,
  allModels,
  ...cellHeaderProps
}: RenderHeaderCellProps<CarDetail> & {
  allMakes: CarMake[]
  allModels: CarModel[]
}) {
  const dispatch = useAppDispatch()
  const selectedValues = useAppSelector(carDataGridUISelectors.selectMakeFilterValues)
  const filterOptions = allMakes.map(mapFilterListOption)

  const onFilterChange = (values: string[]) => dispatch(carDataGridUIActions.setMakeFilterValues({ values, allModels }))

  return (
    <DataGridListFilterColumnHeader
      filterTitle="Make"
      labelRenderer={() => renderHeaderCell(cellHeaderProps)}
      options={filterOptions}
      selectedOptions={selectedValues}
      onFilterChange={onFilterChange}
    />
  )
}

function CarFeatureColumnHeader(cellHeaderProps: RenderHeaderCellProps<CarDetail>) {
  const dispatch = useAppDispatch()
  const [loadOptions, { loading, error: loadError, data: allFeatures }] = useLazyQuery(GET_CAR_FEATURES)
  const selectedValues = useAppSelector(carDataGridUISelectors.selectFeatureFilterValues)
  const filterOptions = allFeatures?.carFeatures.map(mapFilterListOption) ?? []
  const onFilterChange = (values: string[]) => dispatch(carDataGridUIActions.setFeatureFilterValues(values))

  React.useEffect(() => {
    loadOptions()
  }, [loadOptions])

  if (loading || loadError) {
    return (
      <div className="flex items-center justify-between gap-2 *:first:items-center *:first:gap-2">
        {renderHeaderCell(cellHeaderProps)}
        {!loadError ? (
          <Spinner />
        ) : (
          <Button
            variant="destructive"
            size="icon-sm"
            className="size-6"
            title="Retry Loading Filter"
            onClick={() => loadOptions()}
          >
            <RefreshCw />
          </Button>
        )}
      </div>
    )
  }

  return (
    <DataGridListFilterColumnHeader
      filterTitle="Features"
      labelRenderer={() => renderHeaderCell(cellHeaderProps)}
      options={filterOptions}
      selectedOptions={selectedValues}
      onFilterChange={onFilterChange}
    />
  )
}

function YearColumnHeader(cellHeaderProps: RenderHeaderCellProps<CarDetail>) {
  const dispatch = useAppDispatch()
  const filterValues = useAppSelector(carDataGridUISelectors.selectYearRangeFilter)
  const onFilterChange = (values: NumberRangeFilterValues) => dispatch(carDataGridUIActions.setYearRangeFilter(values))

  return (
    <DataGridNumberRangeFilterColumnHeader
      filterTitle="Year"
      labelRenderer={() => renderHeaderCell(cellHeaderProps)}
      rangeValues={filterValues}
      onChange={onFilterChange}
    />
  )
}

function mapFilterListOption(item: { id: string; name: string }) {
  return {
    key: item.id,
    label: item.name,
  }
}

function mapCellEditorListOption(item: { id: string; name: string }) {
  return {
    value: item.id,
    label: item.name,
  }
}
