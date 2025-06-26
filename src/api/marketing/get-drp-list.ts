import { api } from '@/lib'
import { PaginatedReq, PaginatedResponse } from '../types'

export type GetDrpListReq = {
  goods_name?: string
  is_custom?: 1 | 2
  department: number
  status: 1 | 2
} & PaginatedReq

export type GetDrpListRes = Partial<{
  commission_scale_internal: number
  commission_scale_range: {
    min: number
    max: number
  }
  commission_type: number
  costprice: number
  costprice_range: { min: number; max: number }
  ctime: number
  days: number
  department: number
  goods_id: number
  goods_name: string
  id: number
  image: string
  internal_price: number
  internal_price_range: {
    min: number
    max: number
  }
  marketable: number
  price: number
  price_range: { min: number; max: number }
  remove_time: number
  rule_id: number
  secondary_scale: number
  secondary_scale_range: {
    min: number
    max: number
  }
}>

export const getDrpList = (req: GetDrpListReq) =>
  api
    .get<PaginatedResponse<GetDrpListRes>>(
      'jshop-goods/api/v1/goods-distribution',
      { searchParams: req }
    )
    .json()
    .then((res) => res.result)
