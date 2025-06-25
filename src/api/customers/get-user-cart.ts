import { api } from '@/lib'

import { PaginatedReq, PaginatedResponse } from '../types'

export type GetUserCartReq = {
  user_id: number
  start_time?: number
  end_time?: number
  formtype?: number
} & PaginatedReq

export type GetUserCartRes = Partial<{
  ctime: number // 创建时间，Unix 时间戳
  goods_id: number // 商品 ID
  goods_name: string // 商品名称
  goods_url: string // 商品图片链接
  product_id: number // 产品 ID
  product_name: string // 产品名称
  user_id: number // 用户 ID
  nums: number // 商品数量
  formtype: number // 表单类型
  isdel: number // 删除状态（假设 1 表示已删除，2 表示未删除）
}>

export const getUserCart = (req: GetUserCartReq) =>
  api
    .get<PaginatedResponse<GetUserCartRes>>('jshop-order/api/v1/user-cart', {
      searchParams: req
    })
    .json()
    .then((res) => res.result)
