import { api } from '@/lib'

import { PaginatedReq, PaginatedResponse } from '../types'

export type GetAdminCategoriesReq = {
  department: number
} & PaginatedReq

export type GetAdminCategoriesRes = Partial<{
  id: number
  is_sync: number
  name: string
  parent_id: number
  sort: number
  status: number
  type: number
  utime: number
}>

export const getAdminCategories = (req: GetAdminCategoriesReq) =>
  api
    .get<PaginatedResponse<GetAdminCategoriesRes>>('jshop-goods/api/v1/goods-cat-list', { searchParams: req })
    .json()
    .then((res) => res.result)
