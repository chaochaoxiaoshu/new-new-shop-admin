import { api } from '@/lib'

import type { PaginatedReq, PaginatedResponse } from '../types'

export const CouponType = {
  满减券: 1,
  折扣券: 2,
  无门槛券: 3
} as const
export type CouponType = (typeof CouponType)[keyof typeof CouponType]

export const CouponStatus = {
  未开始: 0,
  进行中: 3,
  已结束: 4,
  已失效: 2
} as const
export type CouponStatus = (typeof CouponStatus)[keyof typeof CouponStatus]

export type GetCouponsReq = {
  name?: string
  type?: number
  operate?: number
  department: number
  settings?: number
} & PaginatedReq

export type GetCouponsRes = Partial<{
  id: number
  name: string
  type: CouponType
  contenttype: string
  operate: CouponStatus
  received: number
  total: number
  used: number
  total_coupons: number
  total_amount: number
  ctime: number
  stime: number
  etime: number
  content_type: number
  full: string
  reduction: string
  direct_reduction: string
  direct_threshold: string
  applicable: number
  overlay: number
  department_id: number
  per_person: number
  limited_collar: number
  settings: number
}>

export const getCoupons = (req: GetCouponsReq) =>
  api
    .get<PaginatedResponse<GetCouponsRes>>(
      'jshop-market/api/v1/discount/list',
      { searchParams: req }
    )
    .json()
    .then((res) => res.result)
