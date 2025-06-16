import { api } from '@/lib'

import { ApiResponse } from '../types'

export type GetGoodsDiseaseReq = {
  id?: number
}

export type GetGoodsDiseaseRes = Partial<{
  id: number
  icd_code: string
  icd_name: string
}>

export const getGoodsDisease = (req?: GetGoodsDiseaseReq) =>
  api
    .get<ApiResponse<{ items: GetGoodsDiseaseRes[] }>>(
      'jshop-goods/api/v1/main-goods-disease',
      {
        searchParams: req
      }
    )
    .json()
    .then((res) => res.result)
