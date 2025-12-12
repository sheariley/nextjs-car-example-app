'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

export type DataGridPagerProps = React.ComponentProps<'div'> & {
  loading: boolean
  page: number
  pageSize: number
  totalCount: number
  onPageChange: (value: number) => void
  onPageSizeChange: (value: number) => void
}

export function DataGridPager({
  loading,
  className,
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  ...props
}: DataGridPagerProps) {
  const pageCount = calculatePageCount(pageSize, totalCount)

  return (
    <div className={cn('flex gap-3', className)} {...props}>
      <Button
        disabled={loading || page <= 1}
        variant="outline"
        onClick={() => onPageChange(Math.max(1, page - 1))}
      >
        <ChevronLeft />
      </Button>
      <div className="flex items-center px-2">
        Page&nbsp;<span>{page}</span>&nbsp;of&nbsp;<span>{pageCount}</span>&nbsp;of&nbsp;<span>{totalCount}</span>&nbsp;results
      </div>
      <Button
        disabled={loading || page >= pageCount}
        className="mr-5"
        variant="outline"
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight />
      </Button>
      <div className="hidden items-center sm:flex">Showing</div>
      <Select
        value={pageSize.toString()}
        onValueChange={value => {
          const v = Number(value) || 20
          onPageSizeChange(Math.min(100, Math.max(1, v)))
          onPageChange(1)
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

export function calculatePageCount(pageSize: number, totalCount: number) {
  return Math.ceil(Math.max((totalCount || 0) / pageSize, 1))
}