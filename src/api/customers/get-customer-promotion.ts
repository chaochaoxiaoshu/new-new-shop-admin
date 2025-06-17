import { api } from '@/lib'

import { ApiResponse } from '../types'

export type GetCustomerPromotionReq = {
  user_id: number
}

interface PromotionDetails {
  order_amount: number // 订单总金额
  payed_amount: number // 实际支付金额
  discount_amount: number // 优惠金额
  total_count: number // 商品总数量
  order_count: number // 订单数量
  unit_price: number // 平均单价
  rate: number // 转化率或其他百分比
}

interface RaffleDetails {
  total_count: number // 总抽奖次数
  use_prize_count: number // 已使用奖品数量
  rate: number // 转化率或其他百分比
}

export type GetCustomerPromotionRes = Partial<{
  teambuy: PromotionDetails // 团购信息
  seckill: PromotionDetails // 秒杀信息
  value_pack: PromotionDetails // 超值套餐信息
  fullgift: PromotionDetails // 满赠活动信息
  reduction: PromotionDetails // 满减活动信息
  raffle: RaffleDetails // 抽奖信息
  sum_info: PromotionDetails // 总计信息
}>

export const getCustomerPromotion = (req: GetCustomerPromotionReq) =>
  api
    .get<ApiResponse<GetCustomerPromotionRes>>(
      `jshop-market/api/v1/user-promotion/${req.user_id}`
    )
    .json()
    .then((res) => res.result)
