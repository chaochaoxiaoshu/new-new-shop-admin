import { api } from '@/lib'

import type { PaginatedReq, PaginatedResponse } from '../types'

export type GetAdminSecondaryCategoriesReq = {
  id: number
  department: number
} & PaginatedReq

export type GetAdminSecondaryCategoriesRes = Partial<{
  id: number
  is_sync: number
  name: string
  parent_id: number
  sort: number
  status: number
  type: number
  utime: number
}>

export const getAdminSecondaryCategories = (
  req: GetAdminSecondaryCategoriesReq
) =>
  api
    .get<PaginatedResponse<GetAdminSecondaryCategoriesRes>>(
      `jshop-goods/api/v1/goods-cat-detail-list/${req.id}`,
      {
        searchParams: req
      }
    )
    .json()
    .then((res) => res.result)
