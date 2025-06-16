import { api } from '@/lib'

export type EditGoodsReq = unknown

export const editGoods = (req: EditGoodsReq) =>
  api.put('jshop-goods/api/v1/goods', { json: req })
