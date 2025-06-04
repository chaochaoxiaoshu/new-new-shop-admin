import { api } from '@/lib'

export type UpdateAdminCategoryReq = Partial<{
  id: number
  parent_id: number
  name: string
  sort: number
  type: number
  status: number
  is_sync: number
  utime: number
}>

export const updateAdminCategory = (req: UpdateAdminCategoryReq) =>
  api.put('jshop-goods/api/v1/goods-cat', {
    json: req
  })
