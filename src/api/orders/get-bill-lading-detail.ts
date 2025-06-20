import { api } from '@/lib'

import { ApiResponse } from '../types'
import { OrderInfo, OrderItem } from './get-bill-ladings'

export type GetBillLadingDetailReq = {
  id: number
}

export type GetBillLadingDetailRes = Partial<{
  id: string
  order_id: string
  store_id: number
  store_name: string
  name: string
  mobile: string
  clerk_id: number
  ptime: number
  status: number
  force: number
  ctime: number
  order_info: OrderInfo | null
  order_items: OrderItem[] | null
}>

export const getBillLadingDetail = (req: GetBillLadingDetailReq) =>
  api
    .get<ApiResponse<GetBillLadingDetailRes>>(
      `jshop-order/api/v1/bill-lading/${req.id}`,
      { searchParams: req }
    )
    .json()
    .then((res) => res.result)
