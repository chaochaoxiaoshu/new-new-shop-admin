import { api } from '@/lib'
import { PaginatedReq, PaginatedResponse } from '../types'

export type GetWithdrawalListReq = {
  type?: number
} & PaginatedReq

export type GetWithdrawalListRes = Partial<{
  ctime: number
  error_massage: string
  id: number
  money: number
  out_batch_no: string
  type: number
  user_id: number
  user_name: string
  user_tel: string
  utime: number
  withdrawals: number
}>

export const getWithdrawalList = (req: GetWithdrawalListReq) =>
  api
    .get<PaginatedResponse<GetWithdrawalListRes>>(
      'jshop-pay/api/v1/user-tocash',
      { searchParams: req }
    )
    .json()
    .then((res) => res.result)
