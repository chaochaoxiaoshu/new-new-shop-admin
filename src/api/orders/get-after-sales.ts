import { api, toSearchParams } from '@/lib'

import type { PaginatedReq, PaginatedResponse } from '../types'

export const AfterSalesStatus = {
  待审核: 1,
  审核通过: 2,
  审核驳回: 3,
  售后取消: 4,
  售后失败: 5
} as const
export type AfterSalesStatus =
  (typeof AfterSalesStatus)[keyof typeof AfterSalesStatus]

export const GoodsType = {
  未发货: 1,
  已发货: 2
} as const
export type GoodsType = (typeof GoodsType)[keyof typeof GoodsType]

export const SalesType = {
  仅退款: 1,
  退货退款: 2
} as const
export type SalesType = (typeof SalesType)[keyof typeof SalesType]

export const RefundStatus = {
  未退款: 1,
  已退款: 2,
  退款失败: 3,
  退款拒绝: 4
} as const
export type RefundStatus = (typeof RefundStatus)[keyof typeof RefundStatus]

export const ShipStatus = {
  未发货: 1,
  部分发货: 2,
  已发货: 3,
  部分退货: 4,
  已退货: 5
} as const
export type ShipStatus = (typeof ShipStatus)[keyof typeof ShipStatus]

export const ReturnMethod = {
  邮寄退回商品: 1,
  线下退回商品: 2
} as const
export type ReturnMethod = (typeof ReturnMethod)[keyof typeof ReturnMethod]

export const SubmitType = {
  前台: 1,
  后台: 2
} as const
export type SubmitType = (typeof SubmitType)[keyof typeof SubmitType]

export type GetAfterSalesReq = {
  department_id: number
  after_sales_id?: string
  order_id?: string
  status?: number
  type?: number
  refund_type?: number
  goods_name?: string
  start_time?: number
  end_time?: number
  with_fields: string[]
  user_id?: number
} & PaginatedReq

export type GetAfterSalesRes = Partial<{
  after_sales_id: string
  order_id: string
  user_id: number
  type: GoodsType
  refund: number
  status: AfterSalesStatus
  reason: string
  mark: string
  department_id: number
  ctime: number
  submit_type: SubmitType
  refund_id: string
  refund_status: RefundStatus
  return_method: ReturnMethod
  refund_cos: number
  refund_goods: number
  sales_type: SalesType
  images: null | string[]
  user_info: {
    id: number
    nickname: string
  }
  reship_info: {
    reship_id: string
    order_id: string
    aftersales_id: string
    user_id: number
    status: number
    logi_code: string
    logi_no: string
    memo: string
    ctime: number
    utime: number
    address: string
  }
  after_sales_items: {
    after_sales_id: string
    order_items_id: number
    name: string
    image_url: string
    nums: number
    addon: string
    price: number
    refund_amount?: number
    is_gift?: 1 | 2
  }[]
  be_mailed: 1 | 2
  payment_amount: number
}>

export const getAfterSales = (req: GetAfterSalesReq) =>
  api
    .get<PaginatedResponse<GetAfterSalesRes>>(
      'jshop-order/api/v1/after-sales',
      {
        searchParams: toSearchParams(req)
      }
    )
    .json()
    .then((res) => res.result)
