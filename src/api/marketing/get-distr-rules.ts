import { api } from '@/lib'
import { PaginatedReq, PaginatedResponse } from '../types'

export type GetDistrRulesReq = {
  rule_name?: string
  department: number
} & PaginatedReq

export type GetDistrRulesRes = Partial<{
  commission_scale_internal: number
  commission_type: number
  days: number
  department: number
  id: number
  is_def: number
  is_own: number
  post: number
  recommended_person_setting: number
  referrer_settings: number
  rule_name: string
  secondary_scale: number
  status: number
}>

export const getDistrRules = (req: GetDistrRulesReq) =>
  api
    .get<PaginatedResponse<GetDistrRulesRes>>('jshop-goods/api/v1/goods-rule', {
      searchParams: req
    })
    .json()
    .then((res) => res.result)
