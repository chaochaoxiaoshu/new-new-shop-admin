import { api } from '@/lib'
import { PaginatedReq, PaginatedResponse } from '../types'

export type GetGiveawayListReq = {
  order_id?: string
  start_time?: number
  end_time?: number
  department_id: number
  p_status?: number
} & PaginatedReq

export type OrderInfo = {
  after_sale_manage: string
  after_sale_status: string
  confirm: number
  count_down: number
  ctime: number
  delivery: number
  delivery_type: number
  department_id: number
  is_comment: number
  is_distribution: number
  is_sync: number
  is_yaoqing: number
  mark: string
  memo: string
  order_amount: number
  order_id: string
  order_time: number
  order_type: number
  pay_status: number
  payed: number
  rx_state: number
  ship_address: string
  ship_area_id: number
  ship_mobile: string
  ship_name: string
  ship_status: number
  status: number
  status_order_text: string
  user_id: number
}

export type OrderItem = {
  actual_price: number
  aftersales_nums: number
  aftersales_nums_ed: number
  amount: number
  ave_price: number
  bn: string
  commission: number
  diff_pricetwo: number
  discount_user_id: string
  distribution_id: number
  goods_id: number
  goods_pmt_new: string
  handle: number
  id: number
  image_url: string
  is_gift: number
  is_raise: number
  name: string
  nums: number
  order_id: string
  price: number
  product_id: number
  profitsharing_status: number
  raise_id: number
  refund_amount: number
  secondary_commission: number
  sendnums: number
  sn: string
  spes_desc: string
  weight: number
}

export type GetGiveawayListRes = Partial<{
  id: number
  order_id: string
  order_info: OrderInfo
  order_items: OrderItem[]
}>

export const getGiveawayList = (req: GetGiveawayListReq) =>
  api
    .get<PaginatedResponse<GetGiveawayListRes>>(
      'jshop-order/api/v1/sharing-list',
      {
        searchParams: req
      }
    )
    .json()
    .then((res) => res.result)
