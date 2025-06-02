import { api } from '@/lib/request'
import type { PaginatedResponse } from '../types'

export type GetCustomersStatisticReq = {
  department: number
}

export type GetCustomersStatisticRes = Partial<{
  date: string
  add_total: number
  active_total: number
}>

export const getCustomersStatistic = (req: GetCustomersStatisticReq) =>
  api
    .get<PaginatedResponse<GetCustomersStatisticRes>>(
      'jshop-user/api/v1/home-page/user-statistics',
      { searchParams: req }
    )
    .json()
    .then((res) => res.result)
