import { api } from '@/lib'

import type { PaginatedReq, PaginatedResponse } from '../types'

export type GetCustomerTagsReq = {
  department_id: number
  tag_name?: string
  type?: number
  group_id?: number
} & PaginatedReq

export type GetCustomerTagsRes = Partial<{
  id: number
  tag_name: string
  type: number
  rule_type: number
  status: number
  ctime: number // 时间戳
  user_num: number
  department_id: number
  sort_id: number
  group_id: number
  consume_rule: unknown // 可能是消费规则对象
  assets_rule: unknown // 可能是资产规则对象
  promotion_rule: unknown
}>

/**
 * 获取标签列表
 */
export const getCustomerTags = (req: GetCustomerTagsReq) =>
  api
    .get<PaginatedResponse<GetCustomerTagsRes>>('jshop-user/api/v1/tags', {
      searchParams: req
    })
    .json()
    .then((res) => res.result)
