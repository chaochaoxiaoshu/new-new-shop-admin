import { api } from '@/lib'
import { ApiResponse } from '../types'

export type GetMonthlySummaryStatisticsReq = {
  start_time: number
  end_time: number
  department: number
}

export type GetMonthlySummaryStatisticsRes = Partial<{
  actual_payment: number
  order_commission: number
  refund_amount: number
  shipping_fee: number
  total_amount: number
  total_discount: number
}>

export const getMonthlySummaryStatistics = (
  req: GetMonthlySummaryStatisticsReq
) =>
  api
    .get<ApiResponse<GetMonthlySummaryStatisticsRes>>(
      'jshop-report/api/v1/order-report-statistics',
      { searchParams: req }
    )
    .json()
    .then((res) => res.result)
