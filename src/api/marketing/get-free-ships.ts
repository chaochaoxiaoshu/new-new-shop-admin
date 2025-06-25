import { api, toSearchParams } from '@/lib'

import type { PaginatedReq, PaginatedResponse } from '..'

export const FreeShipStatus = {
  未开始: 0,
  进行中: 3,
  已结束: 4,
  已失效: 2
} as const
export type FreeShipStatus =
  (typeof FreeShipStatus)[keyof typeof FreeShipStatus]

export type GetFreeShipsReq = {
  name?: string
  operate?: number
  department: number
  with_fields?: string | string[]
} & PaginatedReq

export type GetFreeShipsRes = Partial<{
  id: number
  name: string
  full: number
  operate: number
  count_order: number
  count_user: number
  sum_money: number
  ctime: number
  stime: number
  etime: number
  type: number
  applicable: number
  share_type: number[]
  department_id: number
}>

export const getFreeShips = (req: GetFreeShipsReq) =>
  api
    .get<PaginatedResponse<GetFreeShipsRes>>(
      'jshop-market/api/v1/reduction/list',
      {
        searchParams: toSearchParams(req)
      }
    )
    .json()
    .then((res) => res.result)
