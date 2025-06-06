import { api } from '@/lib'

export type DeleteBrandReq = {
  brand_id: number
}

export const deleteBrand = (req: DeleteBrandReq) =>
  api.delete(`jshop-goods/api/v1/brand/${req.brand_id}`)
