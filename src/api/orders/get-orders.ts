import { api, toSearchParams } from '@/lib'

import type { PaginatedReq, PaginatedResponse } from '../types'

export type GetOrdersReq = {
  with_fields?: string[]
  department_id: number
  order_id?: string
  start_time?: number
  end_time?: number
  ship_mobile?: string
  delivery?: number | null
  order_ids?: string
  user_id?: number
  goods_name?: string
  order_status?: number
} & PaginatedReq

export type GetOrdersRes = Partial<{
  order_id: string
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
  is_sync: number
  is_comment: number
  rx_state: number
  delivery_type: number
  is_yaoqing: number
  count_down: number
  order_time: number
  after_sale_status: string
  status_order_text: string
  user_info: {
    id: number
    nickname: string
  }
  order_items: {
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
  }[]
  is_distribution: number
}>

export const getOrders = (req: GetOrdersReq) =>
  api
    .get<PaginatedResponse<GetOrdersRes>>('jshop-order/api/v1/orders', {
      searchParams: toSearchParams(req)
    })
    .json()
    .then((res) => res.result)
