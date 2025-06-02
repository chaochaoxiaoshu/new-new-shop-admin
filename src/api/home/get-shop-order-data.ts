import type { ApiResponse } from '../types'
import { api } from '@/lib/request'

export type GetShopOrderDataReq = {
  type: 1 | 2 | 3
  date: string
  department_id: number
}

export type GetShopOrderDataRes = Partial<{
  payed_amount: number
  payed_amount_yoy: number
  payed_amount_qoq: number
  sales_amount: number
  sales_amount_yoy: number
  sales_amount_qoq: number
  payed_order_num: number
  payed_order_num_yoy: number
  payed_order_num_qoq: number
  visitor_num: number
  visitor_num_yoy: number
  visitor_num_qoq: number
  view_num: number
  view_num_yoy: number
  view_num_qoq: number
  payed_user_num: number
  payed_user_num_yoy: number
  payed_user_num_qoq: number
  average_order_value: number
  average_order_value_yoy: number
  average_order_value_qoq: number
  conversion_rate: number
  conversion_rate_yoy: number
  conversion_rate_qoq: number
  repurchase_rate: number
  repurchase_rate_yoy: number
  repurchase_rate_qoq: number
  new_user_num: number
  new_user_num_yoy: number
  new_user_num_qoq: number
  new_user_payed: number
  new_user_payed_yoy: number
  new_user_payed_qoq: number
  old_user_num: number
  old_user_num_yoy: number
  old_user_num_qoq: number
  old_user_payed: number
  old_user_payed_yoy: number
  old_user_payed_qoq: number
  distribution_total: number
}>

export const getShopOrderData = (req: GetShopOrderDataReq) =>
  api
    .get<ApiResponse<GetShopOrderDataRes>>(
      'jshop-report/api/v1/shop-order-data',
      {
        searchParams: req,
      }
    )
    .json()
    .then((res) => res.result)
