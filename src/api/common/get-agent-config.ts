import type { ApiResponse } from '@/api/types'
import { api } from '@/lib/request'

export type GetAgentConfigReq = {
  url: string
}

export type GetAgentConfigRes = Partial<{
  noncestr: string
  timestamp: number
  signature: string
  corpid: string
  agentid: string
}>

/**
 * SSO 获取企业微信 agentConfig
 */
export const getAgentConfig = (req: GetAgentConfigReq) =>
  api
    .get<ApiResponse<GetAgentConfigRes>>(
      'jshop-user/api/v1/manage/get-agent-config',
      {
        searchParams: req,
      }
    )
    .json()
    .then((res) => res.result)
