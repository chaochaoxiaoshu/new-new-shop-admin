import { api } from '@/lib'
import { PaginatedReq, PaginatedResponse } from '../types'

export type GetBalanceListReq = {
  type?: number
  department: number
} & PaginatedReq

export type GetBalanceListRes = Partial<{
  balance: number
  ctime: number
  id: number
  memo: string
  money: number
  order_id: string
  source_id: string
  type: number
  user_id: number
  user_tel: string
}>

export const getBalanceList = (req: GetBalanceListReq) =>
  api
    .get<PaginatedResponse<GetBalanceListRes>>('jshop-pay/api/v1/balance', {
      searchParams: req
    })
    .json()
    .then((res) => res.result)
