import { api } from '@/lib'

import { PaginatedReq, PaginatedResponse } from '../types'

export type GetTagsReq = {
  group_id: number
  tag_name?: string
  type?: number
} & PaginatedReq

export type GetTagsRes = Partial<{
  ctime: number
  department_id: number
  group_id: number
  id: number
  promotion_rule: null
  rule_type: number
  sort_id: number
  status: number
  tag_name: string
  type: number
  user_num: number
}>

export const getTags = (req: GetTagsReq) =>
  api
    .get<PaginatedResponse<GetTagsRes>>('jshop-user/api/v1/tags', {
      searchParams: req
    })
    .json()
    .then((res) => res.result)
