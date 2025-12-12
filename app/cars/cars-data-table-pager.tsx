'use client'

import React from 'react'

import { DataGridPager } from '@/components/data-grid/data-grid-pager'
import { carDataGridUIActions, carDataGridUISelectors, useAppDispatch, useAppSelector } from '@/lib/store'

export type CarDataTablePagerProps = React.ComponentProps<'div'> & {
  loading: boolean
}

export function CarDataTablePager({ ...props }: CarDataTablePagerProps) {
  const dispatch = useAppDispatch()

  const page = useAppSelector(carDataGridUISelectors.selectPage)
  const setPage = React.useCallback((value: number) => dispatch(carDataGridUIActions.setPage(value)), [dispatch])
  const pageSize = useAppSelector(carDataGridUISelectors.selectPageSize)
  const setPageSize = React.useCallback(
    (value: number) => dispatch(carDataGridUIActions.setPageSize(value)),
    [dispatch]
  )
  const totalResultCount = useAppSelector(carDataGridUISelectors.selectTotalResultCount)

  return (
    <DataGridPager
      page={page}
      pageSize={pageSize}
      totalCount={totalResultCount}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      {...props}
    />
  )
}
