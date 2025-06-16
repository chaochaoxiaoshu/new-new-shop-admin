import { api } from '@/lib'

import { PaginatedReq, PaginatedResponse } from '../types'

export type GetShipTemplatesReq = {
  department: number
} & PaginatedReq

export type GetShipTemplatesRes = Partial<{
  department: number
  id: number
  name: string
  products_count: number
}>

export const getShipTemplates = (req: GetShipTemplatesReq) =>
  api
    .get<PaginatedResponse<GetShipTemplatesRes>>(`jshop-order/api/v1/ship`, {
      searchParams: req
    })
    .json()
    .then((res) => res.result)
