import { api } from '@/lib'

import { ApiResponse } from '../types'

export type GetTagGroupsReq = {
  department_id: number
}

export type GetTagGroupsRes = {
  department_id: number
  group_name: string
  id: number
  sort_id: number
  tags: {
    assets_rule: null
    consume_rule: null
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
  }[]
}

export const getTagGroups = (req: GetTagGroupsReq) =>
  api
    .get<ApiResponse<{ groups: GetTagGroupsRes[] }>>(
      'jshop-user/api/v1/tags-all',
      { searchParams: req }
    )
    .json()
    .then((res) => res.result)
