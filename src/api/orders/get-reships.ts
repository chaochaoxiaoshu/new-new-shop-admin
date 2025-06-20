import { api, toSearchParams } from '@/lib'

import { PaginatedResponse } from '../types'

export type GetReshipsReq = {
  department_id?: number
  reship_id?: string
  order_id?: string
  logi_no?: string
  status?: number
  page?: number
  page_size?: number
}

export type GetReshipsRes = Partial<{
  id: number
  reship_id: string
  order_id: string
  user_info: {
    nickname: string
  }
  status: number
  logi_code: string
  logi_no: string
  ctime: number
  utime: number
}>

export const getReships = async (req: GetReshipsReq) => {
  const searchParams = toSearchParams({
    ...req,
    with_fields: ['reship_items', 'users']
  })

  return await api
    .get<PaginatedResponse<GetReshipsRes>>('jshop-order/api/v1/reship', {
      searchParams
    })
    .json()
    .then((res) => res.result)
}
