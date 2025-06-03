import { useCallback, useMemo, useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import type { PaginatedResponse } from '@/api'

interface UsePaginationOptions<T> {
  queryKey: unknown[]
  queryFn: ({ current, pageSize }: { current: number; pageSize: number }) => Promise<PaginatedResponse<T>['result']>
  default?: {
    current?: number
    pageSize?: number
  }
}

export function usePagination<T>(options: UsePaginationOptions<T>) {
  const { queryKey, queryFn, default: defaultParams } = options

  const [paginationParams, setPaginationParams] = useState({
    current: defaultParams?.current || 1,
    pageSize: defaultParams?.pageSize || 10
  })

  const query = useQuery({
    queryKey: [...queryKey, paginationParams.current, paginationParams.pageSize],
    queryFn: () =>
      queryFn({
        current: paginationParams.current,
        pageSize: paginationParams.pageSize
      })
  })

  const { total } = useMemo(() => {
    if (!query.data) return { total: 0 }
    return {
      total: query.data.paginate.total
    }
  }, [query.data])

  const changeCurrent = useCallback(
    (current: number) =>
      setPaginationParams((prev) => ({
        ...prev,
        current
      })),
    []
  )

  const changePageSize = useCallback(
    (pageSize: number) =>
      setPaginationParams(() => ({
        current: 1,
        pageSize
      })),
    []
  )

  return {
    ...query,
    pagination: {
      current: paginationParams.current,
      pageSize: paginationParams.pageSize,
      total,
      changeCurrent,
      changePageSize
    }
  }
}
