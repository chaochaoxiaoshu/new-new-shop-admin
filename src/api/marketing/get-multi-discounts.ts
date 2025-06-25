import { api } from '@/lib'

import type { PaginatedReq, PaginatedResponse } from '..'

export const MultiDiscountStatus = {
  未开始: 1,
  进行中: 2,
  已结束: 3,
  暂停中: 5
} as const
export type MultiDiscountStatus =
  (typeof MultiDiscountStatus)[keyof typeof MultiDiscountStatus]

export type GetMultiDiscountsReq = {
  department: number
  name?: string
  operate?: number
  stime?: number
  etime?: number
} & PaginatedReq

export type GetMultiDiscountsRes = Partial<{
  id: number
  name: string
  stime: number // 开始时间戳
  etime: number // 结束时间戳
  payment_order: number
  payment_amount: number
  operate: number
  ctime: number // 创建时间戳
  nums: number // 第几件商品享受折扣
  discount: number // 折扣力度（如：5表示5折）
  content: string
}>

export const getMultiDiscounts = (req: GetMultiDiscountsReq) =>
  api
    .get<PaginatedResponse<GetMultiDiscountsRes>>(
      'jshop-market/api/v1/piece/list',
      { searchParams: req }
    )
    .json()
    .then((res) => res.result)
