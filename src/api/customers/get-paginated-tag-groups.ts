import { api } from '@/lib'

import { PaginatedReq, PaginatedResponse } from '../types'

export type GetPaginatedTagGroupsReq = {
  department_id: number
} & PaginatedReq

export type GetPaginatedTagGroupsRes = Partial<{
  department_id: number
  group_name: string
  id: number
  sort_id: number
}>

export const getPaginatedTagGroups = (req: GetPaginatedTagGroupsReq) =>
  api
    .get<PaginatedResponse<GetPaginatedTagGroupsRes>>(
      'jshop-user/api/v1/tags-group',
      { searchParams: req }
    )
    .json()
    .then((res) => res.result)
