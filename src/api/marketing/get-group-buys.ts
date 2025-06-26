import { api } from '@/lib'

import type { PaginatedReq, PaginatedResponse } from '..'

export const GroupBuyStatus = {
  预告中: 0,
  未开始: 1,
  进行中: 2,
  已结束: 3,
  已删除: 4
} as const
export type GroupBuyStatus =
  (typeof GroupBuyStatus)[keyof typeof GroupBuyStatus]

export type GetGroupBuysReq = {
  name?: string
  operate?: number
  start_time?: number
  end_time?: number
  department: number
} & PaginatedReq

export type GetGroupBuysRes = Partial<{
  id: number
  name: string
  stime: number
  etime: number
  clustering_nums: number
  clustering_people: number
  clustering_order: number
  clustering_price: number
  operate: number
  department: number
}>

export const getGroupBuys = (req: GetGroupBuysReq) =>
  api
    .get<PaginatedResponse<GetGroupBuysRes>>(
      'jshop-market/api/v1/teambuy/index',
      { searchParams: req }
    )
    .json()
    .then((res) => res.result)
