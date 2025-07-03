import { api } from '@/lib'
import { PaginatedReq, PaginatedResponse } from '../types'

export type GetOrderDimensionStatisticsReq = {
  order_id?: string
  start_time?: number
  end_time?: number
  share_method?: number
  department_id: number
} & PaginatedReq

export type GetOrderDimensionStatisticsRes = Partial<{
  activity_name: string
  aftersales_nums: number
  aftersales_status_str: string
  aftersales_type: string
  bill_lading_id: string
  buy_mobile: string
  buy_name: string
  commission_amount: number
  complete_month: string
  complete_time: number
  delivery: number
  discount_amount: number
  freight: number
  goods_name: string
  goods_nums: number
  logi_no: string
  mark: string
  memo: string
  order_id: string
  order_status_str: string
  otc_department: string
  otc_username: string
  p_company: string
  p_mobile: string
  p_name: string
  p_user_id: number
  pay_amount: number
  pay_time: number
  product_name: string
  refund_amount: number
  refund_freight: number
  refund_time: number
  settlement_time: number
  share_method: number
  ship_address: string
  ship_mobile: string
  ship_name: string
  ship_status_str: string
  sp_company: string
  sp_mobile: string
  sp_name: string
  supply_price: number
  total_amount: number
  department_name: string
}>

export const getOrderDimensionStatistics = (
  req: GetOrderDimensionStatisticsReq
) =>
  api
    .get<PaginatedResponse<GetOrderDimensionStatisticsRes>>(
      'jshop-report/api/v1/order/distribution-statistics',
      { searchParams: req }
    )
    .json()
    .then((res) => res.result)
