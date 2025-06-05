import { unprotectedApi } from '@/lib'

import type { ApiResponse } from '..'

export type GetDepartmentsForAccountReq = {
  username: string
  password: string
}

export type GetDepartmentsForAccountRes = Partial<{
  departments: {
    id: number
    name: string
  }[]
  is_super: boolean
}>

/**
 * 使用账号密码获取账号的事业部列表
 */
export const getDepartmentsForAccount = (req: GetDepartmentsForAccountReq) =>
  unprotectedApi
    .get<ApiResponse<GetDepartmentsForAccountRes>>(
      'jshop-user/api/v1/manage-info',
      {
        searchParams: req
      }
    )
    .json()
    .then((res) => res.result)
