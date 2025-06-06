import { api } from '@/lib'

import { PaginatedReq, PaginatedResponse } from '../types'

export type GetGoodsSecondaryCategoriesReq = {
  id: number
  name?: string
  department: number
} & PaginatedReq

export type GetGoodsSecondaryCategoriesRes = Partial<{
  id: number
  parent_id: number
  name: string
  sort: number
  status: number
  ctime: number
  utime: number
  department: number
}>

export const getGoodsSecondaryCategories = (
  req: GetGoodsSecondaryCategoriesReq
) =>
  api
    .get<PaginatedResponse<GetGoodsSecondaryCategoriesRes>>(
      `jshop-goods/api/v1/department-type-detail-list/${req.id}`,
      {
        searchParams: req
      }
    )
    .json()
    .then((res) => res.result)
