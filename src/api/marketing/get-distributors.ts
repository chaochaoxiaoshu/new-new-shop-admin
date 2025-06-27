import { api } from '@/lib'
import { PaginatedReq, PaginatedResponse } from '../types'

export type GetDistributorsReq = {
  is_promoter: 1 | 0
  examine?: 1 | 2 | 3
  first_distributors?: string
  superior_distributor?: string
} & PaginatedReq

export type GetDistributorsRes = Partial<{
  agreement: number
  commission: number
  ctime: number
  customer_num: number
  distributor_mobile: string
  distributor_nickname: string
  distributor_num: number
  examine: number
  id: number
  inviter: string
  mobile: string
  nickname: string
  order_money: number
  order_num: number
  reason: string
  secondary_id: number
  set_commission: number
  sign_end_time: number
  sign_status: string
  sign_time: number
}>

export const getDistributors = (req: GetDistributorsReq) =>
  api
    .get<PaginatedResponse<GetDistributorsRes>>(
      'jshop-user/api/v1/user-distributors',
      {
        searchParams: req
      }
    )
    .json()
    .then((res) => res.result)
