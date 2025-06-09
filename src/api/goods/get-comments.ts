import { api, cleanObject } from '@/lib'

import { PaginatedReq, PaginatedResponse } from '..'

export type GetCommentsReq = {
  goods_id?: number
  name?: string
  order_id?: string
  department?: number
  display?: 1 | 2
  start_time?: number
  end_time?: number
} & PaginatedReq

export type GetCommentsRes = Partial<{
  addon: string // 规格信息
  content: string // 评论内容
  ctime: number // 创建时间（时间戳）
  department: number // 部门ID
  display: number // 是否显示
  goods_id: number // 商品ID
  id: number // 评论ID
  images: string // 图片URL
  name: string // 商品名称
  order_id: string // 订单号
  score: number // 评分
  user_avatar: string // 用户头像
  user_id: number // 用户ID
  user_mobile: string // 用户手机号
  user_nickname: string // 用户昵称
  user_tel: string // 用户电话
}>

export const getComments = (req: GetCommentsReq) =>
  api
    .get<PaginatedResponse<GetCommentsRes>>(
      'jshop-goods/api/v1/goods-comments',
      { searchParams: cleanObject(req) }
    )
    .json()
    .then((res) => res.result)
