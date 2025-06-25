import { api } from '@/lib'

import type { PaginatedReq, PaginatedResponse } from '..'

export const FlashSaleStatus = {
  预告中: 0,
  未开始: 1,
  进行中: 2,
  已结束: 3
} as const
export type FlashSaleStatus =
  (typeof FlashSaleStatus)[keyof typeof FlashSaleStatus]

export type GetFlashSalesReq = {
  name?: string
  department: number
  operate?: number
} & PaginatedReq

export type GetFlashSalesRes = Partial<{
  id: number
  name: string
  stime: number
  etime: number
  clustering_order: number
  clustering_price: number
  operate: number
  department: number
}>

export const getFlashSales = (req: GetFlashSalesReq) =>
  api
    .get<PaginatedResponse<GetFlashSalesRes>>(
      'jshop-market/api/v1/seckills/index',
      { searchParams: req }
    )
    .json()
    .then((res) => res.result)
