import type { PaginatedResponse } from '../types'
import { api } from '@/lib/request'

export type GetOrdersStatisticReq = {
  department: number
}

export type GetOrdersStatisticRes = Partial<{
  date: string
  pay_total: number
  ship_total: number
}>

export const getOrdersStatistic = (req: GetOrdersStatisticReq) =>
  api
    .get<PaginatedResponse<GetOrdersStatisticRes>>(
      'jshop-order/api/v1/home-page/order-statistics',
      { searchParams: req }
    )
    .json()
    .then((res) => res.result)
