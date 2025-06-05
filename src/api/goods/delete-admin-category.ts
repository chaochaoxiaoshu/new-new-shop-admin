import { api } from '@/lib'

export type DeleteAdminCategoryReq = {
  id: number
}

export const deleteAdminCategory = (req: DeleteAdminCategoryReq) =>
  api.delete(`jshop-goods/api/v1/goods-cat-delete/${req.id}`)
