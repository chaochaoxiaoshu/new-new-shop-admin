import { api } from '@/lib'

import { ApiResponse } from '../types'

export type GetCustomerPropertyReq = {
  user_id: number
}

export type GetCustomerPropertyRes = Partial<{
  user_discount: {
    available_discount_num: number // 可用优惠券数量
    used_discount_num: number // 已使用优惠券数量
    invalid_discount_num: number // 已失效优惠券数量
  }
  user_wallet: {
    balance: number // 钱包余额
    total_payed_amount: number // 累计支付金额
  }
  user_prize: {
    d_status: number // 奖品类型 D 的状态
    y_status: number // 奖品类型 Y 的状态
    g_status: number // 奖品类型 G 的状态
  }
}>

export const getCustomerProperty = (req: GetCustomerPropertyReq) =>
  api
    .get<ApiResponse<GetCustomerPropertyRes>>(
      'jshop-market/api/v1/discounts/user-property',
      { searchParams: req }
    )
    .json()
    .then((res) => res.result)
