import { api } from '@/lib'

import type { ApiResponse } from '../types'

export type GetTodoBoardReq = {
  department_id: number
}

export type GetTodoBoardRes = Partial<{
  unpaid_count: number
  unship_count: number
  after_sales_count: number
  total_warn: number
}>

export const getTodoBoard = (req: GetTodoBoardReq) =>
  api
    .get<ApiResponse<GetTodoBoardRes>>('jshop-report/api/v1/todo-list', {
      searchParams: req
    })
    .json()
    .then((res) => res.result)
