import { api, toSearchParams } from '@/lib'

import { PaginatedReq, PaginatedResponse } from '../types'

export type GetDeliveriesReq = {
  department_id: number
  delivery_id?: string
  order_id?: string
  logi_no?: string
  ship_mobile?: string
} & PaginatedReq

export type GetDeliveriesRes = Partial<{
  delivery_id: string
  logi_code: string
  logi_no: string
  logi_information: string
  logi_status: number
  ship_area_id: number
  ship_address: string
  ship_name: string
  ship_mobile: string
  confirm_time: number
  status: number
  department_id: number
  memo: string
  ctime: number
  order_id: string
}>

export const getDeliveries = (req: GetDeliveriesReq) => {
  const searchParams = toSearchParams({
    ...req,
    with_fields: ['delivery_items']
  })

  return api
    .get<PaginatedResponse<GetDeliveriesRes>>('jshop-order/api/v1/deliveries', {
      searchParams
    })
    .json()
    .then((res) => res.result)
}
