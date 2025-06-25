import { api } from '@/lib'

import type { PaginatedReq, PaginatedResponse } from '..'

export const AddonPurchaseStatus = {
  未开始: 1,
  进行中: 2,
  已结束: 3,
  已失效: 4
} as const
export type AddonPurchaseStatus =
  (typeof AddonPurchaseStatus)[keyof typeof AddonPurchaseStatus]

export type GetAddonPurchasesReq = {
  department_id: number
  name?: string
  status?: number
} & PaginatedReq

export type GetAddonPurchasesRes = Partial<{
  id: number
  name: string
  start_time: number // 开始时间戳
  end_time: number // 结束时间戳
  full_price: number // 满额条件
  tag_ids: number[] // 标签ID列表
  group_buying: number[] // 团购设置
  share_type: number[] // 分享类型
  raise_type: number // 加价购类型
  department_id: number // 部门ID
  status: number // 活动状态
  activity_goods: null | unknown[] // 活动商品列表
  raise_goods: null | unknown[] // 加价购商品列表
  count_order: number // 订单统计
  count_user: number // 用户统计
  sum_money: number // 总金额
  unit_price: number
}>

export const getAddonPurchases = (req: GetAddonPurchasesReq) =>
  api
    .get<PaginatedResponse<GetAddonPurchasesRes>>(
      'jshop-market/api/v1/raise-price',
      { searchParams: req }
    )
    .json()
    .then((res) => res.result)
