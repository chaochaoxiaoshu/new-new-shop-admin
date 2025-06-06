import { api } from '@/lib'

export type DeleteGoodsCategoryReq = {
  id: number
}

export const deleteGoodsCategory = (req: DeleteGoodsCategoryReq) =>
  api.delete(`jshop-goods/api/v1/department-type/${req.id}`)
