import { api, toSearchParams } from '@/lib'

import type { PaginatedReq, PaginatedResponse } from '..'

export const SpendMPayNStatus = {
  未开始: 'no_start',
  进行中: 'in_progress',
  已结束: 'completed',
  已失效: 'invalid'
} as const
export type SpendMPayNStatus =
  (typeof SpendMPayNStatus)[keyof typeof SpendMPayNStatus]

export type GetSpendMPayNReq = {
  name?: string
  state?: string
  ids?: string[]
  department_id: number
} & PaginatedReq

export type GetSpendMPayNRes = Partial<{
  id: string
  name: string
  start_time: number
  end_time: number
  rule: {
    full_total: number
    pay_total: number
  }
  is_all_goods: boolean
  goods_ids: number[]
  share_type: string[]
  state: string
  hidelinks_url: string
  payment_order: number
  partici_pating: number
  total_amount: number
  pen_price: number
  department_id: number
}>

export const getSpendMPayN = (req: GetSpendMPayNReq) =>
  api
    .get<PaginatedResponse<GetSpendMPayNRes>>(
      'jshop-market/api/v1/full/m/pay/n',
      { searchParams: toSearchParams(req) }
    )
    .json()
    .then((res) => res.result)
