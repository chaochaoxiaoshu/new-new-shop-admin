import { api, toSearchParams } from '@/lib'

import { PaginatedReq, PaginatedResponse } from '../types'

export type GetCustomersReq = {
  with_fields?: string[]
  department: number
  mobile?: string
  nickname?: string
} & PaginatedReq

export type GetCustomersRes = Partial<{
  id: number
  nickname: string
  mobile: string
  pid: number
  secondary_id: number
  is_promoter: number
  commission: number
  set_commission: number
  balance: number
  workcode: string
  promoter_url: string
  poster_url: string
  ctime: number
  p_nickname: string
  p_company: string
  p_mobile: string
  identity: number
  total_payed_amount: number
  total_order_num: number
  total_refund_amount: number
  tag_id: string
  avatar: string
  tag_name: string
  tag_groups: null
}>

export const getCustomers = async (req: GetCustomersReq) => {
  const searchParams = toSearchParams(req)

  return await api
    .get<PaginatedResponse<GetCustomersRes>>('jshop-user/api/v1/users', {
      searchParams
    })
    .json()
    .then((res) => res.result)
}
