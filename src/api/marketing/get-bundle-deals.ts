import { api, toSearchParams } from '@/lib'

import type { PaginatedReq, PaginatedResponse } from '..'

export const BundleDealStatus = {
  未开始: 0,
  进行中: 3,
  已结束: 4,
  已失效: 2
} as const
export type BundleDealStatus =
  (typeof BundleDealStatus)[keyof typeof BundleDealStatus]

export type GetBundleDealsReq = {
  name?: string
  operate?: number
  department: number
  with_fields?: string[]
} & PaginatedReq

export type GetBundleDealsRes = Partial<{
  id: number
  name: string
  price: number
  num: number
  stime: number
  etime: number
  ctime: number
  operate: number
  order_num: number
  user_num: number
  amount: number
  department: number
  goods_ids: number[]
}>

export const getBundleDeals = (req: GetBundleDealsReq) =>
  api
    .get<PaginatedResponse<GetBundleDealsRes>>(
      'jshop-market/api/v1/valuepack',
      {
        searchParams: toSearchParams(req)
      }
    )
    .json()
    .then((res) => res.result)
