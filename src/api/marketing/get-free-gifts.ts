import { api, toSearchParams } from '@/lib'

import type { PaginatedReq, PaginatedResponse } from '..'

export const FreeGiftsStatus = {
  未开始: 'no_start',
  进行中: 'in_progress',
  已结束: 'completed',
  已失效: 'invalid'
} as const
export type FreeGiftsStatus =
  (typeof FreeGiftsStatus)[keyof typeof FreeGiftsStatus]

export type GetFreeGiftsReq = {
  name?: string
  state?: string
  ids?: string[]
  department_id: number
  with_fields?: string[]
} & PaginatedReq

export type GetFreeGiftsRes = Partial<{
  id: string
  name: string
  start_time: number
  end_time: number
  rule: string
  rule_list: {
    full_total: number
    max_num: number
    every_kind_num: number
    goods_ids: number[]
    goods_list: unknown[]
  }[]
  is_all_goods: boolean
  goods_ids: number[]
  share_type: string[]
  state: string
  activity_type: string
  calculate_rule: string
  hidelinks_url: string
  payment_order: number
  partici_pating: number
  total_amount: number
  pen_price: number
  department_id: number
}>

export const getFreeGifts = (req: GetFreeGiftsReq) =>
  api
    .get<PaginatedResponse<GetFreeGiftsRes>>(
      'jshop-market/api/v1/full-discounts',
      {
        searchParams: toSearchParams(req)
      }
    )
    .json()
    .then((res) => res.result)
