import { api } from '@/lib'

import { PaginatedReq, PaginatedResponse } from '../types'

export type GetUserSharingRecordsReq = {
  user_id: number
  start_time?: number
  end_time?: number
  goods_name?: string
} & PaginatedReq

export type GetUserSharingRecordsRes = Partial<{
  id: number
  user_id: number
  goods_id: number
  goods_name: string
  ctime: number
  goods_url: string
}>

export const getUserSharingRecords = (req: GetUserSharingRecordsReq) =>
  api
    .get<PaginatedResponse<GetUserSharingRecordsRes>>(
      'jshop-user/api/v1/user-sharing-records',
      {
        searchParams: req
      }
    )
    .json()
    .then((res) => res.result)
