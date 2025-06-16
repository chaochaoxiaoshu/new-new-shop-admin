import { api } from '@/lib'

import { ApiResponse } from '../types'

export type GetGoodsDrugstoresRes = Partial<{
  id: number
  drugstore_name: string
}>

export const getGoodsDrugstores = () =>
  api
    .get<ApiResponse<{ items: GetGoodsDrugstoresRes[] }>>(
      'jshop-goods/api/v1/main-goods-drugstore'
    )
    .json()
    .then((res) => res.result)
