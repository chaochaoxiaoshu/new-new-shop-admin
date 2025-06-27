import { api } from '@/lib'
import { PaginatedReq, PaginatedResponse } from '../types'

export type GetMonthlyReportReq = {
  order_id?: string
  start_time?: number
  end_time?: number
  department: number
} & PaginatedReq

export type GetMonthlyReportRes = Partial<{
  commission_amount: string
  cost_freight: string
  delivery_name: string
  goods_amount: string
  goods_name: string
  goods_num: string
  methods: string
  order_id: string
  payed: string
  payment_time: number
  refund_money: string
  status_order_text: string
  totalAmount: string
}>

export const getMonthlyReport = (req: GetMonthlyReportReq) =>
  api
    .get<PaginatedResponse<GetMonthlyReportRes>>(
      'jshop-report/api/v1/report-statistical',
      { searchParams: req }
    )
    .json()
    .then((res) => res.result)
