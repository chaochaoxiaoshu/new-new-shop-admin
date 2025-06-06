import { api } from '@/lib'

import { ApiResponse } from '../types'

export type GetAdminCategoriesTreeReq = {
  department?: number
}

export type GetAdminCategoriesTreeRes = Partial<{
  id: number
  parent_id: number
  name: string
}>

export const getAdminCategoriesTree = (req: GetAdminCategoriesTreeReq) => {
  return api
    .get<ApiResponse<{ items: GetAdminCategoriesTreeRes[] }>>(
      'jshop-goods/api/v1/goods-cat-tree-list',
      {
        searchParams: req
      }
    )
    .json()
    .then((res) => res.result)
}
