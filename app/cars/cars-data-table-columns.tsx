import { ArrowRightCircle } from 'lucide-react'
import Link from 'next/link'
import { Column, renderHeaderCell, RenderHeaderCellProps, SelectColumn } from 'react-data-grid'

import { Button } from '@/components/ui/button'
import { CarDetail } from '@/types/car-detail'
import { CarDetailFilterablePropKeys } from './cars-data-table-types'
import DataGridListFilter, { DataGridListFilterOption } from './data-grid-list-filter'
import DataGridNumberRangeFilter, { DataGridNumberRangeFilterValues } from './data-grid-number-range-filter'

export type ColumnsFactoryProps = {
  onToggleFilterOption: (columnKey: CarDetailFilterablePropKeys, optionKey: string) => void
  listFilterOptions: Record<CarDetailFilterablePropKeys, DataGridListFilterOption<string>[]>
  selectedListFilterOptions: Record<CarDetailFilterablePropKeys, string[]>
  yearRangeFilter: DataGridNumberRangeFilterValues
  onYearRangeFilterChange: (range: DataGridNumberRangeFilterValues) => void
}

export function columnsFactory({
  onToggleFilterOption,
  listFilterOptions,
  selectedListFilterOptions,
  yearRangeFilter,
  onYearRangeFilterChange,
}: ColumnsFactoryProps): Column<CarDetail>[] {
  // header renderer factory that shows a filter icon and a popover with options
  const renderListFilterHeader = (columnKey: CarDetailFilterablePropKeys, columnName: string) => {
    const renderer = (renderProps: RenderHeaderCellProps<CarDetail>) => {
      const opts = listFilterOptions[columnKey] ?? []
      const selOpts = selectedListFilterOptions[columnKey] ?? []

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
    renderer.displayName = 'DataGridListColumnFilter'

    return renderer
  }

  const renderYearFilterHeader = (renderProps: RenderHeaderCellProps<CarDetail>) => {
    return (
      <DataGridNumberRangeFilter
        filterTitle="Year"
        labelRenderer={() => renderHeaderCell(renderProps)}
        rangeValues={yearRangeFilter}
        onChange={onYearRangeFilterChange}
      />
    )
  }
  renderYearFilterHeader.displayName = 'DataGridNumberRangeColumnFilter'

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
      renderHeaderCell: renderListFilterHeader('carModelId', 'Model'),
    },
    {
      name: 'Make',
      key: 'CarMake',
      renderCell: props => props.row.CarMake?.name,
      sortable: true,
      renderHeaderCell: renderListFilterHeader('carMakeId', 'Make'),
    },
    {
      name: 'Year',
      key: 'year',
      sortable: true,
      renderHeaderCell: renderYearFilterHeader,
    },
    {
      name: 'Features',
      key: 'CarDetailFeatures',
      renderCell: props =>
        !props.row.CarDetailFeatures ? 'None' : props.row.CarDetailFeatures?.map(df => df.CarFeature!.name).join(', '),
      sortable: false,
      renderHeaderCell: renderListFilterHeader('CarDetailFeatures', 'Features'),
    },
  ]
}