'use client';

import { CarDetail } from '@/types/car-detail';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<CarDetail>[] = [
  {
    header: 'Make',
    accessorKey: 'makeId',
    accessorFn: row => row.CarMake?.name
  },
  {
    header: 'Model',
    accessorKey: 'modelId',
    accessorFn: row => row.CarModel?.name
  },
  {
    header: 'Year',
    accessorKey: 'year'
  }
]

// TODO: Consider adding features to the table