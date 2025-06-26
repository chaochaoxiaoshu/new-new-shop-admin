import { api } from '@/lib'
import { PaginatedReq, PaginatedResponse } from '../types'

export type GetDistrCustomersReq = {
  user_mobile?: string
  p_user_mobile?: string
  binding_relationship?: 1 | 2
  department: number
} & PaginatedReq

export type GetDistrCustomersRes = Partial<{
  avatar: string
  binding_protection: number
  binding_relationship: 1 | 2
  binding_time: number
  binding_validity: number
  id: number
  p_user_id: number
  p_user_mobile: string
  p_user_name: string
  unbinding_time: number
  user_id: number
  user_mobile: string
  user_name: string
}>

export const getDistrCustomers = (req: GetDistrCustomersReq) =>
  api
    .get<PaginatedResponse<GetDistrCustomersRes>>(
      'jshop-user/api/v1/customer-query',
      {
        searchParams: req
      }
    )
    .json()
    .then((res) => res.result)
