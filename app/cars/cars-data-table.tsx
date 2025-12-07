'use client'

import useCarDataApiClient from '@/api-clients/mock-car-data-api-client'
import { CarDetail } from '@/types/car-detail'
import { useEffect, useState } from 'react'
import { Column, DataGrid } from 'react-data-grid'

export default function CarsDataTable() {
  const dataClient = useCarDataApiClient()
  const [rows, setRows] = useState<CarDetail[]>([])
  
  useEffect(() => {
    async function fetchData() {
      const data = await dataClient.getData()
      setRows(data)
    }

    fetchData()
  }, [dataClient])

  return (
    <div className="container mx-auto py-10">
      <DataGrid columns={columns} rows={rows} rowKeyGetter={carRowKeyGetter} />
    </div>
  )
}

export const columns: Column<CarDetail>[] = [
  {
    name: 'Make',
    key: 'makeId',
    renderCell: props => props.row.CarMake?.name
  },
  {
    name: 'Model',
    key: 'modelId',
    renderCell: props => props.row.CarModel?.name
  },
  {
    name: 'Year',
    key: 'year'
  }
]

export function carRowKeyGetter(row: CarDetail) {
  return row.id;
}