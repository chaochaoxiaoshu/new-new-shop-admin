import { api } from '@/lib'

import { PaginatedReq, PaginatedResponse } from '../types'

export type GetUserBrowsingReq = {
  user_id: number
  start_time?: number
  end_time?: number
  goods_name?: string
} & PaginatedReq

export type GetUserBrowsingRes = Partial<{
  id: number
  user_id: number
  goods_id: number
  goods_name: string
  ctime: number
  leave_citme: number
  duration: string
  goods_url: string
}>

export const getUserBrowsing = (req: GetUserBrowsingReq) =>
  api
    .get<PaginatedResponse<GetUserBrowsingRes>>(
      'jshop-user/api/v1/user-browsing',
      {
        searchParams: req
      }
    )
    .json()
    .then((res) => res.result)
