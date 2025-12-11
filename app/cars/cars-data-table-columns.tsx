import { useLazyQuery } from '@apollo/client/react'
import { ArrowRightCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { Column, renderHeaderCell, RenderHeaderCellProps, SelectColumn } from 'react-data-grid'

import { Button } from '@/components/ui/button'
import {
  carDataGridUIActions,
  carDataGridUISelectors,
  NumberRangeFilterValues,
  useAppDispatch,
  useAppSelector,
} from '@/lib/store'
import DataGridListFilter from './data-grid-list-filter'
import DataGridNumberRangeFilter from './data-grid-number-range-filter'

import { Spinner } from '@/components/ui/spinner'
import { GET_CAR_FEATURES } from '@/graphql/operations'
import { CarDetail } from '@/types/car-detail'
import { CarMake } from '@/types/car-make'
import { CarModel } from '@/types/car-model'

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
      renderCell: props => (
        <Button asChild variant="link" className="flex w-full justify-between" title="View Details">
          <Link href={`/cars/${props.row.id}`}>
            {props.row.CarModel?.name} <ArrowRightCircle />
          </Link>
        </Button>
      ),
      sortable: true,
      renderHeaderCell: cellHeaderProps => <CarModelColumnHeader allModels={allModels} {...cellHeaderProps} />,
    },
    {
      name: 'Make',
      key: 'CarMake',
      renderCell: props => props.row.CarMake?.name,
      sortable: true,
      renderHeaderCell: cellHeaderProps => (
        <CarMakeColumnHeader allModels={allModels} allMakes={allMakes} {...cellHeaderProps} />
      ),
    },
    {
      name: 'Year',
      key: 'year',
      sortable: true,
      renderHeaderCell: cellHeaderProps => <YearColumnHeader {...cellHeaderProps} />,
    },
    {
      name: 'Features',
      key: 'CarDetailFeatures',
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
      sortable: false,
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
    <DataGridListFilter
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
    <DataGridListFilter
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
    <DataGridListFilter
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
    <DataGridNumberRangeFilter
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
