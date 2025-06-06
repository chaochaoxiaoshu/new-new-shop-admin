import { api } from '@/lib'

import { ApiResponse } from '../types'

export type GetBrandDetailReq = {
  id: number
}

export type GetBrandDetailRes = {
  brand_id: number
  department: number
  logo: string
  logo_url: string
  name: string
  sort: number
  utime: number
}

export const getBrandDetail = (req: GetBrandDetailReq) =>
  api
    .get<ApiResponse<GetBrandDetailRes>>(`jshop-goods/api/v1/brand/${req.id}`)
    .json()
    .then((res) => res.result)
