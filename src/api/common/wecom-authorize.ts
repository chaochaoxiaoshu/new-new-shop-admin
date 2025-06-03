import { unprotectedApi } from '@/lib'

import type { ApiResponse } from '..'

export type WeComAuthorizeReq = {
  code: string
}

export type WeComAuthorizeRes = Partial<{
  access_token: string
  token_type: string
  expires_in: number
  username: string
  department_id: number
}>

/**
 * SSO 使用 code 鉴权
 */
export const wecomAuthorize = (req: WeComAuthorizeReq) =>
  unprotectedApi
    .get<ApiResponse<WeComAuthorizeRes>>('jshop-user/api/v1/manage/wecom-authorize', {
      searchParams: req
    })
    .json()
    .then((res) => res.result)
