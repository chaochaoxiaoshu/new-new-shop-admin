import { unprotectedApi } from '@/lib'

import type { ApiResponse } from '..'

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

export const login = (req: LoginReq) =>
  unprotectedApi
    .post<ApiResponse<LoginRes>>('jshop-user/api/v1/manage/authorize', {
      json: req
    })
    .json()
    .then((res) => res.result)
