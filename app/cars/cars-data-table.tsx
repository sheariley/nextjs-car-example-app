'use client';

import useCarDataApiClient from '@/api-clients/mock-car-data-api-client';
import { DataTable } from "@/components/ui/data-table";
import { CarDetail } from '@/types/car-detail';
import { useEffect, useState } from 'react';
import { columns } from "./columns";

export default function CarsDataTable() {
  const dataClient = useCarDataApiClient();
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
      <DataTable columns={columns} data={rows} />
    </div>
  )
}