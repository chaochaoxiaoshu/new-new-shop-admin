import { api } from '@/lib'

import { PaginatedReq, PaginatedResponse } from '../types'

export type GetShipTempsReq = {
  department: number
} & PaginatedReq

export type GetShipTempsRes = Partial<{
  department: number
  id: number
  name: string
  products_count: number
}>

export const getShipTemps = (req: GetShipTempsReq) =>
  api
    .get<PaginatedResponse<GetShipTempsRes>>('jshop-order/api/v1/ship', {
      searchParams: req
    })
    .json()
    .then((res) => res.result)
