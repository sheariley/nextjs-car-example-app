import { ArrowRightCircle } from 'lucide-react'
import Link from 'next/link'
import { Column, renderHeaderCell, RenderHeaderCellProps, SelectColumn } from 'react-data-grid'

import { DataGridDropdownCellEditor } from '@/components/data-grid/data-grid-dropdown-cell-editor'
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

import { CarDetail } from '@/types/car-detail'
import { CarFeature } from '@/types/car-feature'
import { CarMake } from '@/types/car-make'
import { CarModel } from '@/types/car-model'

export type ColumnsFactoryProps = {
  allMakes: CarMake[]
  allModels: CarModel[]
  allFeatures: CarFeature[]
}

export function columnsFactory({ allMakes, allModels, allFeatures }: ColumnsFactoryProps): Column<CarDetail>[] {
  return [
    SelectColumn,
    {
      name: 'Model',
      key: 'CarModel',
      sortable: true,
      editable: true,
      renderCell: props => (
        <div className="flex items-center justify-between">
          <span>{props.row.CarModel?.name}</span>
          <Button asChild variant="link" size="icon-sm" title="View Details">
            <Link href={`/cars/${props.row.id}`}>
              <ArrowRightCircle />
            </Link>
          </Button>
        </div>
      ),
      renderHeaderCell: cellHeaderProps => <CarModelColumnHeader allModels={allModels} {...cellHeaderProps} />,
      renderEditCell: editorProps => (
        <DataGridDropdownCellEditor
          options={allModels.filter(x => x.carMakeId === editorProps.row.carMakeId).map(mapCellEditorListOption)}
          multiple={false}
          valueRenderer={value => allModels.find(m => m.id === value)?.name ?? ''}
          valueGetter={row => row.carModelId}
          valueSetter={(value, row) => ({ ...row, carModelId: value })}
          {...editorProps}
        />
      ),
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
          valueSetter={(value, row) => ({ ...row, carMakeId: value })}
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
      editable: true,
      renderCell: props => {
        const cellText = !props.row.CarDetailFeatures?.length
          ? 'None'
          : props.row.CarDetailFeatures?.map(df => df.CarFeature!.name).join(', ')
        return (
          <div className="inline-block max-w-[200px] truncate" title={cellText}>
            {cellText}
          </div>
        )
      },
      renderHeaderCell: cellHeaderProps => <CarFeatureColumnHeader allFeatures={allFeatures} {...cellHeaderProps} />,
      renderEditCell: editorProps => (
        <DataGridDropdownCellEditor
          options={allFeatures.map(mapCellEditorListOption)}
          multiple={true}
          valueRenderer={value => (
            <div className="inline-block max-w-[180px] truncate">
              {allFeatures
                .filter(m => value.includes(m.id))
                .map(x => x.name)
                .join(', ')}
            </div>
          )}
          valueGetter={row => row.CarDetailFeatures?.map(x => x.featureId) || []}
          valueSetter={(value, row) => ({
            ...row,
            CarDetailFeatures: value.map(featureId => ({
              featureId,
              carDetailId: row.id,
              CarFeature: allFeatures.find(x => x.id === featureId),
            })),
          })}
          {...editorProps}
        />
      ),
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

function CarFeatureColumnHeader({
  allFeatures,
  ...cellHeaderProps
}: RenderHeaderCellProps<CarDetail> & {
  allFeatures: CarFeature[]
}) {
  const dispatch = useAppDispatch()
  const selectedValues = useAppSelector(carDataGridUISelectors.selectFeatureFilterValues)
  const filterOptions = allFeatures.map(mapFilterListOption) ?? []
  const onFilterChange = (values: string[]) => dispatch(carDataGridUIActions.setFeatureFilterValues(values))

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
