import { api } from '@/lib'

import { PaginatedResponse } from '../types'

export type GetGoodsCategoriesTreeReq = {
  department: number
}

export type GetGoodsCategoriesTreeRes = Partial<{
  id: number
  parent_id: number
  name: string
  data: null
}>

export const getGoodsCategoriesTree = (req: GetGoodsCategoriesTreeReq) =>
  api
    .get<PaginatedResponse<GetGoodsCategoriesTreeRes>>(
      'jshop-goods/api/v1/department-type-tree-list',
      { searchParams: req }
    )
    .json()
    .then((res) => res.result)
