import { api } from '@/lib'

export type AddAdminCategoryReq = {
  parent_id?: number
  name?: string
  sort?: number
  status?: number
  department?: number
}

export const addAdminCategory = (req: AddAdminCategoryReq) => {
  return api.post('jshop-goods/api/v1/goods-cat', {
    json: req
  })
}
