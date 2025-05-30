import type { ApiResponse } from '@/api/types'
import { unprotectedApi } from '@/lib/request'

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
export const getDepartmentsForAccount = async (
  req: GetDepartmentsForAccountReq
) => {
  const params = new URLSearchParams(req)
  const res = await unprotectedApi
    .get<ApiResponse<GetDepartmentsForAccountRes>>(
      `jshop-user/api/v1/manage-info?${params.toString()}`
    )
    .json()

  return res.result
}
