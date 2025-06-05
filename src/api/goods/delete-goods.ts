import { api } from '@/lib'

export type DeleteGoodsReq = {
  id: number
}

export type DeleteGoodsRes = null

export const deleteGoods = (req: DeleteGoodsReq) =>
  api.delete(`jshop-goods/api/v1/goods/${req.id.toString()}`)
