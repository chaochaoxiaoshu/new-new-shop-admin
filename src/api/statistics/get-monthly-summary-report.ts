import { api } from '@/lib'
import { PaginatedReq, PaginatedResponse } from '../types'

export type GetMonthlySummaryReportReq = {
  order_id?: string
  start_time: number
  end_time: number
  department: number
} & PaginatedReq

export type GetMonthlySummaryReportRes = Partial<{
  commission_amount: string
  complete_time: number
  cost_freight: string
  delivery_name: string
  goods_amount: string
  goods_name: string
  goods_num: string
  id: number
  make_payment: number
  methods: string
  order_id: string
  payed: string
  payment_time: number
  refund_money: string
  status_order_text: string
  totalAmount: string
}>

export const getMonthlySummaryReport = (req: GetMonthlySummaryReportReq) =>
  api
    .get<PaginatedResponse<GetMonthlySummaryReportRes>>(
      'jshop-report/api/v1/order-report',
      { searchParams: req }
    )
    .json()
    .then((res) => res.result)
