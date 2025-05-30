import type { ApiResponse } from '@/api/types'
import { unprotectedApi } from '@/lib/request'

export type LoginReq = {
  username: string
  password: string
  department_id: number | null
}

export type LoginRes = Partial<{
  access_token: string
  department_id: number
  expires_in: number
  token_type: string
  username: string
}>

export const login = async (req: LoginReq) => {
  const res = await unprotectedApi
    .post<ApiResponse<LoginRes>>('jshop-user/api/v1/manage/authorize', {
      json: req
    })
    .json()
  return res.result
}
