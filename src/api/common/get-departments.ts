import { api, toSearchParams } from '@/lib'

import type { PaginatedResponse } from '..'

export type GetDepartmentsReq = {
  ids?: number[]
  pageIndex: number
  pageSize: number
}

export type GetDepartmentsRes = Partial<{
  id: number
  department_name: string
  ship_status: number
  status: number
  pickup: number
  price: number
  reship_name: string
  reship_mobile: string
  reship_area_id: number
  reship_address: string
  wln_param_id: number
  send_erp_id: number
  jst_param_id: number
  ctime: number
  utime: number
  reship_area_ids: number | null
}>

/**
 * 获取事业部列表
 */
export const getDepartments = async (req?: GetDepartmentsReq) => {
  const searchParams = req ? toSearchParams(req) : void 0

  const res = await api
    .get<
      PaginatedResponse<GetDepartmentsRes>
    >('jshop-user/api/v1/department', { searchParams })
    .json()

  return res.result
}
