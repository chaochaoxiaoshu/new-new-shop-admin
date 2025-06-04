import { api } from '@/lib'

import { ApiResponse } from '../types'

export type GetGoodsStatusReq = {
  department_id: number
}

export type GetGoodsStatusRes = Partial<{
  total_goods: number
  total_marketable: number
  total_unmarketable: number
  total_warn: number
}>

export const getGoodsStatus = (req: GetGoodsStatusReq) =>
  api
    .get<ApiResponse<GetGoodsStatusRes>>('jshop-goods/api/v1/goods-stat', {
      searchParams: req
    })
    .json()
    .then((res) => res.result)
