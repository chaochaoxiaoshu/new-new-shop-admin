import { api } from '@/lib'

import { PaginatedReq, PaginatedResponse } from '../types'

export const UserCouponIsUse = {
  已使用: 1,
  未使用: 2,
  停止使用: 3
} as const
export type UserCouponIsUse =
  (typeof UserCouponIsUse)[keyof typeof UserCouponIsUse]

export type GetUserCouponsReq = {
  user_id: number
  is_use?: UserCouponIsUse
  discount_name?: string
  use_start_time?: number
  use_end_time?: number
  collection_start_time?: number
  collection_end_time?: number
} & PaginatedReq

export type GetUserCouponsRes = Partial<{
  code: string
  collection_time: number
  discount_id: number
  discount_name: string
  etime: number
  id: number
  is_use: UserCouponIsUse
  is_use_name: string
  mobile: string
  nickname: string
  offer_content: string
  stime: number
  type: number
  type_name: string
  use_time: number
  user_id: number
  utime: number
}>

export const getUserCoupons = (req: GetUserCouponsReq) =>
  api
    .get<PaginatedResponse<GetUserCouponsRes>>(
      'jshop-market/api/v1/discounts/discount-user',
      { searchParams: req }
    )
    .json()
    .then((res) => res.result)
