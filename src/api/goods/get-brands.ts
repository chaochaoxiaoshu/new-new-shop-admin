import { api, cleanObject } from '@/lib'

import type { PaginatedResponse } from '../types'

export type GetBrandsReq = {
  name?: string
  department_id?: number
}

export type GetBrandsRes = Partial<{
  brand_id: number
  name: string
  logo: string
  logo_url: string
  utime: number
}>

/**
 * 获取品牌列表
 */
export const getBrands = (req: GetBrandsReq) =>
  api
    .get<Omit<PaginatedResponse<GetBrandsRes>, 'paginate'>>(
      'jshop-goods/api/v1/brands',
      {
        searchParams: cleanObject(req)
      }
    )
    .json()
    .then((res) => res.result)
