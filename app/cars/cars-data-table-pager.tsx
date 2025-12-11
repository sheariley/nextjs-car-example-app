'use client'


import { ChevronLeft, ChevronRight } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { carDataGridUIActions, carDataGridUISelectors, useAppDispatch, useAppSelector } from '@/lib/store'
import { cn } from '@/lib/utils'

export type CarDataTablePagerProps = React.ComponentProps<'div'> & {
  loading: boolean
}

export function CarDataTablePager({
  loading,
  className,
  ...props
}: CarDataTablePagerProps) {
  const dispatch = useAppDispatch()
  
  const page = useAppSelector(carDataGridUISelectors.selectPage)
  const setPage = React.useCallback((value: number) => dispatch(carDataGridUIActions.setPage(value)), [dispatch])
  const pageSize = useAppSelector(carDataGridUISelectors.selectPageSize)
  const setPageSize = React.useCallback((value: number) => dispatch(carDataGridUIActions.setPageSize(value)), [dispatch])
  const totalResultCount = useAppSelector(carDataGridUISelectors.selectTotalResultCount)
  const pageCount = useAppSelector(carDataGridUISelectors.selectPageCount)

  return (
    <div className={cn('flex gap-3', className)} {...props}>
      <Button
        disabled={loading || page <= 1}
        variant="outline"
        onClick={() => setPage(Math.max(1, page - 1))}
      >
        <ChevronLeft />
      </Button>
      <div className="flex items-center px-2">
        Page&nbsp;<span>{page}</span>&nbsp;of&nbsp;<span>{pageCount}</span>&nbsp;of&nbsp;<span>{totalResultCount}</span>&nbsp;results
      </div>
      <Button
        disabled={loading || page >= pageCount}
        className="mr-5"
        variant="outline"
        onClick={() => setPage(page + 1)}
      >
        <ChevronRight />
      </Button>
      <div className="hidden items-center sm:flex">Showing</div>
      <Select
        value={pageSize.toString()}
        onValueChange={value => {
          const v = Number(value) || 20
          setPageSize(Math.min(100, Math.max(1, v)))
          setPage(1)
        }}
      >
        <SelectTrigger disabled={loading}>
          <SelectValue placeholder="Page size"></SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="20">20</SelectItem>
          <SelectItem value="50">50</SelectItem>
          <SelectItem value="100">100</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex items-center">per page</div>
    </div>
  )
}