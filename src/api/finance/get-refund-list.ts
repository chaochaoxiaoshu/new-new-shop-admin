import { api } from '@/lib'
import { PaginatedReq, PaginatedResponse } from '../types'

export type GetRefundListReq = {
  refund_id?: string
  source_id?: string
  status?: number
  department: number
} & PaginatedReq

export type GetRefundListRes = Partial<{
  aftersales_id: string
  ctime: number
  money: number
  new_memo: string
  payment_code: string
  refund_id: string
  source_id: string
  status: number
  tkctime: number
  type: number
  user_id: number
  user_tel: string
}>

export const getRefundList = (req: GetRefundListReq) =>
  api
    .get<PaginatedResponse<GetRefundListRes>>('jshop-pay/api/v1/bill-refund', {
      searchParams: req
    })
    .json()
    .then((res) => res.result)
