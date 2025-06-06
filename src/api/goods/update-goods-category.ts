import { api } from '@/lib'

export type UpdateGoodsCategoryReq = {
  id?: number
  parent_id?: number
  name?: string
  sort?: number
  status?: number
  department?: number
}

export const updateGoodsCategory = (req: UpdateGoodsCategoryReq) =>
  api.put('jshop-goods/api/v1/department-type', { json: req })
