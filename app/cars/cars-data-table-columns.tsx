import { ArrowRightCircle } from 'lucide-react'
import Link from 'next/link'
import { Column, renderHeaderCell, SelectColumn } from 'react-data-grid'

import { Button } from '@/components/ui/button'
import { NumberRangeFilterValues } from '@/lib/store'
import { CarDetail } from '@/types/car-detail'

import DataGridListFilter, { DataGridListFilterOption } from './data-grid-list-filter'
import DataGridNumberRangeFilter from './data-grid-number-range-filter'

export type ColumnsFactoryProps = {
  makeFilterOptions: DataGridListFilterOption<string>[]
  makeFilterValues: string[]
  modelFilterOptions: DataGridListFilterOption<string>[]
  modelFilterValues: string[]
  featureFilterOptions: DataGridListFilterOption<string>[]
  featureFilterValues: string[]
  onMakeFilterChange: (values: string[]) => void
  onModelFilterChange: (value: string[]) => void
  onFeatureFilterChange: (value: string[]) => void
  yearRangeFilterValues: NumberRangeFilterValues
  onYearRangeFilterChange: (range: NumberRangeFilterValues) => void
}

export function columnsFactory({
  makeFilterOptions,
  makeFilterValues,
  modelFilterOptions,
  modelFilterValues,
  featureFilterOptions,
  featureFilterValues,
  onMakeFilterChange,
  onModelFilterChange,
  onFeatureFilterChange,
  yearRangeFilterValues,
  onYearRangeFilterChange,
}: ColumnsFactoryProps): Column<CarDetail>[] {
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
      renderHeaderCell: cellHeaderProps => (
        <DataGridListFilter
          filterTitle="Model"
          labelRenderer={() => renderHeaderCell(cellHeaderProps)}
          options={modelFilterOptions}
          selectedOptions={modelFilterValues}
          onFilterChange={onModelFilterChange}
        />
      ),
    },
    {
      name: 'Make',
      key: 'CarMake',
      renderCell: props => props.row.CarMake?.name,
      sortable: true,
      renderHeaderCell: cellHeaderProps => (
        <DataGridListFilter
          filterTitle="Make"
          labelRenderer={() => renderHeaderCell(cellHeaderProps)}
          options={makeFilterOptions}
          selectedOptions={makeFilterValues}
          onFilterChange={onMakeFilterChange}
        />
      ),
    },
    {
      name: 'Year',
      key: 'year',
      sortable: true,
      renderHeaderCell: cellHeaderProps => (
        <DataGridNumberRangeFilter
          filterTitle="Year"
          labelRenderer={() => renderHeaderCell(cellHeaderProps)}
          rangeValues={yearRangeFilterValues}
          onChange={onYearRangeFilterChange}
        />
      ),
    },
    {
      name: 'Features',
      key: 'CarDetailFeatures',
      renderCell: props => {
        const cellText = !props.row.CarDetailFeatures?.length ? 'None' : props.row.CarDetailFeatures?.map(df => df.CarFeature!.name).join(', ')
        return (
          <span className="inline-block truncate max-w-[200px]" title={cellText}>
            {cellText}
          </span>
        )
      },
      sortable: false,
      renderHeaderCell: cellHeaderProps => (
        <DataGridListFilter
          filterTitle="Features"
          labelRenderer={() => renderHeaderCell(cellHeaderProps)}
          options={featureFilterOptions}
          selectedOptions={featureFilterValues}
          onFilterChange={onFeatureFilterChange}
        />
      ),
    },
  ]
}
