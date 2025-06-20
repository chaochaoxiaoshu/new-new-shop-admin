import { api } from '@/lib'

import { PaginatedReq, PaginatedResponse } from '../types'

export type GetBillLadingsReq = {
  department_id: number
  id?: string
  name?: string
  order_id?: string
  mobile?: string
  store_id?: number
  status?: number
} & PaginatedReq

export interface OrderItem {
  id: number
  order_id: string
  goods_id: number
  product_id: number
  sn: string
  bn: string
  name: string
  price: number
  ave_price: number
  image_url: string
  nums: number
  amount: number
  weight: number
  sendnums: number
  is_gift: number
  discount_user_id: string
  goods_pmt_new: string
  spes_desc: string
  aftersales_nums: number
  diff_pricetwo: number
  actual_price: number
  raise_id: number
  aftersales_nums_ed: number
  is_raise: number
  commission: number
  secondary_commission: number
  distribution_id: number
  handle: number
  profitsharing_status: number
  refund_amount: number
}

export interface OrderInfo {
  order_id: string
  payed: number
  order_amount: number
  pay_status: number
  ship_status: number
  status: number
  order_type: number
  user_id: number
  confirm: number
  delivery: number
  ship_area_id: number
  ship_address: string
  ship_name: string
  ship_mobile: string
  memo: string
  mark: string
  ctime: number
  department_id: number
  is_sync: number
  is_comment: number
  rx_state: number
  delivery_type: number
  is_yaoqing: number
  count_down: number
  order_time: number
  after_sale_status: string
  status_order_text: string
  after_sale_manage: string
  is_distribution: number
}

export type GetBillLadingsRes = Partial<{
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
  order_info: OrderInfo
  order_items: OrderItem[]
}>

export const getBillLadings = (req: GetBillLadingsReq) =>
  api
    .get<PaginatedResponse<GetBillLadingsRes>>(
      'jshop-order/api/v1/bill-lading',
      { searchParams: req }
    )
    .json()
    .then((res) => res.result)
