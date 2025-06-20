import { api } from '@/lib'

import { PaginatedResponse } from '../types'

export type GetStoreListReq = {
  page_index: 1
  page_size: 100
  department_id: number
}

export type GetStoreListRes = Partial<{
  id: number
  store_name: string
  address: string
  area_id: number
  department_id: number
  linkman: string
  mobile: string
  customer_tel: string
  logo: string
  logo_url: string
  ctime: number
  utime: number
}>

export const getStoreList = (req: GetStoreListReq) =>
  api
    .get<PaginatedResponse<GetStoreListRes>>('jshop-user/api/v1/stores', {
      searchParams: req
    })
    .json()
    .then((res) => res.result)
