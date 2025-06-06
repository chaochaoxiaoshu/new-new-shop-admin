import { api } from '@/lib'

import { PaginatedReq, PaginatedResponse } from '../types'

export type GetGoodsCategoriesReq = {
  name?: string
  department: number
} & PaginatedReq

export type GetGoodsCategoriesRes = Partial<{
  id: number
  parent_id: number
  name: string
  sort: number
  status: number
  ctime: number
  utime: number
  department: number
}>

export const getGoodsCategories = (req: GetGoodsCategoriesReq) =>
  api
    .get<PaginatedResponse<GetGoodsCategoriesRes>>(
      'jshop-goods/api/v1/department-type-list',
      { searchParams: req }
    )
    .json()
    .then((res) => res.result)
