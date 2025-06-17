import { api } from '@/lib'

import { ApiResponse } from '../types'

export type GetCustomerProfileReq = {
  user_id: number
}

export type GetCustomerProfileRes = Partial<{
  last_order: {
    last_order_amount: number // 最后一次订单金额
    last_order_time: number // 最后一次订单时间 (UNIX 时间戳)
    last_order_num: number // 最后一次订单商品数量
  }
  accumulated_consumption: {
    total_order_amount: number
    last_order_amount: number // 累计订单金额
    total_payed_amount: number // 累计支付金额
    total_discount_amount: number // 累计优惠金额
    total_order_num: number // 累计订单数量
    total_goods_num: number // 累计商品数量
  }
  consumption_sanalysis: {
    ave_order_amount: number // 平均订单金额
    ave_goods_num: number // 平均商品数量
    purchase_rate: number // 购买率
  }
  sales_analysis: {
    total_refund_amount: number // 累计退款金额
    total_aftersales_num: number // 累计售后数量
    aftersales_rate: number // 售后率 (%)
  }
}>

export const getCustomerProfile = (req: GetCustomerProfileReq) =>
  api
    .get<ApiResponse<GetCustomerProfileRes>>(
      'jshop-order/api/v1/orders/user-profile',
      { searchParams: req }
    )
    .json()
    .then((res) => res.result)
