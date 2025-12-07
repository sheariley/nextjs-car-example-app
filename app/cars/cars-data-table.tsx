'use client'

import useCarDataApiClient from '@/api-clients/mock-car-data-api-client'
import { Checkbox, CheckboxChangeHandler } from '@/components/ui/checkbox'
import { CarDetail } from '@/types/car-detail'
import { MouseEvent, useCallback, useEffect, useState } from 'react'
import { Column, DataGrid, RenderCheckboxProps, SelectColumn } from 'react-data-grid'

export default function CarsDataTable() {
  const dataClient = useCarDataApiClient()
  const [rows, setRows] = useState<CarDetail[]>([])
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<string>>(new Set<string>())
  
  useEffect(() => {
    async function fetchData() {
      const data = await dataClient.getData()
      setRows(data)
    }

    fetchData()
  }, [dataClient])
  
  return (
    <div className="container mx-auto py-10">
      <DataGrid
       columns={columns}
       rows={rows}
       rowKeyGetter={carRowKeyGetter}
       selectedRows={selectedRows}
       onSelectedRowsChange={setSelectedRows}
       renderers={{
        renderCheckbox: DataTableCheckbox
       }}
      />
    </div>
  )
}

const columns: Column<CarDetail>[] = [
  SelectColumn,
  {
    name: 'Make',
    key: 'makeId',
    renderCell: props => props.row.CarMake?.name,
    sortable: true
  },
  {
    name: 'Model',
    key: 'modelId',
    renderCell: props => props.row.CarModel?.name,
    sortable: true
  },
  {
    name: 'Year',
    key: 'year',
    sortable: true
  }
]

function carRowKeyGetter(row: CarDetail) {
  return row.id;
}

// custom renderer to use ShadCN's checkbox in the data-grid
function DataTableCheckbox(props: RenderCheckboxProps) {  
  const {
    onChange,
    indeterminate,
    checked,
    ...commonProps
  } = props

  const changeHandler = useCallback<CheckboxChangeHandler>((event, checkedState) => {
    const shift = (event.nativeEvent as unknown as MouseEvent<HTMLInputElement>).shiftKey
    onChange(checkedState === true, shift)
  }, [onChange])

  return (
    <Checkbox
      checked={indeterminate ? 'indeterminate' : checked}
      onCheckedChange={changeHandler}
      {...commonProps}
    />
  )
}
