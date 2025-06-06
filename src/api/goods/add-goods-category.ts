import { api } from '@/lib'

export type AddGoodsCategoryReq = {
  parent_id?: number
  name?: string
  sort?: number
  department?: number
}

export const addGoodsCategory = (req: AddGoodsCategoryReq) =>
  api.post('jshop-goods/api/v1/department-type', { json: req })
