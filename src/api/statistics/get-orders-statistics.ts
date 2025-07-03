import { api } from '@/lib'
import { PaginatedResponse } from '../types'

export type GetOrdersStatisticsReq = {
  start_time?: number
  end_time?: number
  department_id?: number
  page_index: 1
  page_size: 31
}

export type GetOrdersStatisticsRes = Partial<{
  date: string
  paid_amount: number
  paid_num: number
  total_amount: number
  total_num: number
  unpaid_amount: number
  unpaid_num: number
}>

export const getOrdersStatistics = (req: GetOrdersStatisticsReq) =>
  api
    .get<PaginatedResponse<GetOrdersStatisticsRes>>(
      'jshop-report/api/v1/order/order-statistics',
      {
        searchParams: req
      }
    )
    .json()
    .then((res) => res.result)
