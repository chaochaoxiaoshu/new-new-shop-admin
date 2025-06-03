import { unprotectedApi } from '@/lib'

import type { ApiResponse } from '..'

export type SwitchAuthorzieReq = {
  department_id: number
  token: string
}

export type SwitchAuthorzieRes = Partial<{
  access_token: string
  token_type: string
  expires_in: number
  username: string
  department_id: number
}>

/**
 * SSO 提交所选的事业部
 */
export const switchAuthorzie = (req: SwitchAuthorzieReq) =>
  unprotectedApi
    .post<ApiResponse<SwitchAuthorzieRes>>('jshop-user/api/v1/manage/switch-authorize', {
      json: req
    })
    .json()
    .then((res) => res.result)
