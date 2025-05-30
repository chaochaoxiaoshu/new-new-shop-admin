import { api } from '@/lib/request'
import type { ApiResponse } from '../types'

export type GetPlatformInfoReq = {
  type: string
}

export type GetPlatformInfoRes = Partial<{
  items: {
    about_article: string
    about_article_id: string
    privacy_policy: string
    privacy_policy_id: string
    recommend_keys: string
    shop_beian: string
    shop_logo: string
    shop_logo_url: string
    shop_name: string
    user_agreement: string
    user_agreement_id: string
  }
}>

export const getPlatformInfo = async (req: GetPlatformInfoReq) => {
  const params = new URLSearchParams(req)
  const res = await api
    .get<ApiResponse<GetPlatformInfoRes>>(`platform-info?${params.toString()}`)
    .json()

  return res.result
}
