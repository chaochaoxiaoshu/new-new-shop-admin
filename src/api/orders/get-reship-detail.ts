import { api } from '@/lib'

import { ApiResponse } from '../types'

export type GetReshipDetailReq = {
  reship_id: string
}

export interface ReshipItem {
  reship_id: string
  sn: string
  bn: string
  name: string
  nums: number
  image_url: string
}

export interface UserInfo {
  id: number
  nickname: string
}

export type GetReshipDetailRes = Partial<{
  order_id: string
  reship_id: string
  status: number
  logi_code: string
  logi_no: string
  ctime: number
  utime: number
  user_id: number
  user_info: UserInfo
  reship_items: ReshipItem[]
}>

export const getReshipDetail = (req: GetReshipDetailReq) =>
  api
    .get<ApiResponse<GetReshipDetailRes>>(
      `jshop-order/api/v1/reship/${req.reship_id}`
    )
    .json()
    .then((res) => res.result)
