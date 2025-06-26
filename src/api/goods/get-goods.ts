import { api, toSearchParams } from '@/lib'

import type { PaginatedReq, PaginatedResponse } from '..'

export type GetGoodsReq = {
  name?: string
  marketable?: 1 | 2
  is_hidelinks?: 1 | 2
  brand_id?: number
  is_distribution?: 1 | 2
  bn?: string
  is_lnternal?: 1 | 2
  is_member_price?: 1 | 2
  is_approve?: 1 | 2
  goods_cat_id?: number
  ship_id?: number
  department_id?: number | string
  with_fields?: string[]
} & PaginatedReq

export type GetGoodsRes = Partial<{
  goods_id: number
  name: string
  price: number
  costprice: number
  mktprice: number
  image_id: string
  image_url: string
  stock: number
  marketable: 1 | 2
  brand_id: number
  brand_name: string
  goods_type_id: number
  goods_type_name: string
  product_list: unknown
  seckill_list: unknown
  teambuy_list: unknown
  spes_desc: string
  buy_count: number
  main_goods_id: number
  main_goods_info: unknown
  department_id: number
  is_sync: 1 | 2
  sort: number
  is_lnternal: 1 | 2
  goods_departype_id: number
  goods_departype_name: string
  internal_price: number
  is_member_price: 1 | 2
  goods_cat_id: number
  goods_cat_name: string
  is_rx: 1 | 2
  is_hidelinks: 1 | 2
  delivery_type: number
  supplyprice: number
  ship_id: number
  weight: number
  bn: string
}>

export const getGoods = async (req?: GetGoodsReq) => {
  const searchParams = req ? toSearchParams(req) : void 0

  const res = await api
    .get<PaginatedResponse<GetGoodsRes>>('jshop-goods/api/v1/goods', {
      searchParams
    })
    .json()

  return res.result
}
