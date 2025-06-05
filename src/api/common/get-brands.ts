import { api } from '@/lib'

import type { PaginatedResponse } from '..'

export type GetBrandsReq = {
  department_id: number
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
        searchParams: req
      }
    )
    .json()
    .then((res) => res.result)
