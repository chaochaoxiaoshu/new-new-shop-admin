import { api } from '@/lib'
import {
  DeliveryType,
  IsRx
} from '@/pages/_protected/commodity/merchandiseCon/detail/-definition'

import type { ApiResponse } from '..'

export type GetGoodsDetailReq = {
  id?: number
}

export type GetGoodsDetailRes = Partial<{
  id: number
  name: string
  brief: string
  goods_cat_id: number
  goods_departype_id: number
  brand_id: number
  marketable: 1 | 2
  intro: string
  parameters: {
    key: string
    value: string
  }[]
  is_recommend: 1 | 2
  is_hot: 1 | 2
  ship_id: number
  is_approve: 1 | 2
  is_hidelinks: 1 | 2
  delivery_type: DeliveryType
  is_purchase: 1 | 2
  purchase_name: string
  purchase_num: number
  is_rx: IsRx
  products: {
    id: number
    goods_id: number
    sn: string
    price: number
    costprice: number
    mktprice: number
    marketable: 1 | 2
    stock: number
    freeze_stock: number
    weight: number
    spes_desc: string
    is_default: 1 | 2
    image_url: string
    is_lnternal: 1 | 2
    internal_price: number
    is_member_price: 1 | 2
    spes_nums: number
    sort: number
    supplyprice: number
    unit: string
  }[]
  images: {
    image_id: string
    image_url: string
    is_main: 1 | 2
    sort: number
  }[]
  videos: {
    video_id: string
    video_url: string
    sort: number
  }[]
  try_disease: { id: number; icd_name: string; icd_code: string }[] | null
  medicine_tips: { key: string; value: string }[]
  drugstore_id: number
}>

export const getGoodsDetail = (req: GetGoodsDetailReq) =>
  api
    .get<ApiResponse<GetGoodsDetailRes>>(
      `jshop-goods/api/v1/goods-info/${req.id?.toString()}`
    )
    .json()
    .then((res) => res.result)
