import { api } from '@/lib'
import { PaginatedReq, PaginatedResponse } from '../types'

export type GetPaymentListReq = {
  payment_id?: string
  status?: number
  department: number
} & PaginatedReq

export type GetPaymentListRes = Partial<{
  ctime: number
  money: number
  payment_code: string
  payment_id: string
  source_id: string
  status: number
  trade_no: string
  type: number
  user_id: number
  user_tel: string
}>

export const getPaymentList = (req: GetPaymentListReq) =>
  api
    .get<PaginatedResponse<GetPaymentListRes>>(
      'jshop-pay/api/v1/bill-payments',
      { searchParams: req }
    )
    .json()
    .then((res) => res.result)
