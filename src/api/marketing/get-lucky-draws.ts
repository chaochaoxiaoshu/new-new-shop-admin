import { api } from '@/lib'

import type { PaginatedReq, PaginatedResponse } from '..'

export const LuckyDrawStatus = {
  未开始: 1,
  进行中: 2,
  已结束: 3,
  暂停中: 5
} as const
export type LuckyDrawStatus =
  (typeof LuckyDrawStatus)[keyof typeof LuckyDrawStatus]

export type GetLuckyDrawsReq = {
  name?: string
  operate?: number
  stime?: number
  etime?: number
  department_id: number
} & PaginatedReq

export type GetLuckyDrawsRes = Partial<{
  id: number
  name: string
  stime: number // 开始时间戳
  etime: number // 结束时间戳
  use_num: number
  prize_num: number
  operate: number
  ctime: number
}>

export const getLuckyDraws = (req: GetLuckyDrawsReq) =>
  api
    .get<PaginatedResponse<GetLuckyDrawsRes>>(
      'jshop-market/api/v1/raffle/list',
      { searchParams: req }
    )
    .json()
    .then((res) => res.result)
