import { api } from '@/lib'

import type { ApiResponse } from '..'

export type GetDepartmentsByTokenReq = {
  token: string
}

export type GetDepartmentsByTokenRes = Partial<{
  is_super: boolean
  departments: {
    id: number
    name: string
  }[]
}>

/**
 * SSO 使用第一个 token 获取账号的事业部列表
 */
export const getDepartmentsByToken = (req: GetDepartmentsByTokenReq) =>
  api
    .get<ApiResponse<GetDepartmentsByTokenRes>>('jshop-user/api/v1/manage-info-by-token', {
      headers: {
        Authorization: `Bearer ${req.token}`
      }
    })
    .json()
    .then((res) => res.result)
