import { api } from '@/lib'
import { PaginatedReq, PaginatedResponse } from '../types'

export type GetProductsStatisticsReq = {
  start?: string
  end?: string
  department_id: number
} & PaginatedReq

export type GetProductsStatisticsRes = Partial<{
  goods_name: string
  product_name: string
  department_name: string
  sn: string
  sale_nums: number
  sale_amount: number
  refund_nums: number
  refund_amount: number
  view_nums: number
  settle_amount: number
  no_settle_amount: number
  take_nums: number
  verify_take_nums: number
}>

export const getProductsStatistics = (req: GetProductsStatisticsReq) =>
  api
    .get<PaginatedResponse<GetProductsStatisticsRes>>(
      'jshop-report/api/v1/products-statistics',
      {
        searchParams: req
      }
    )
    .json()
    .then((res) => res.result)
