import { api } from '@/lib'

export type AddGoodsReq = unknown

export const addGoods = (req: AddGoodsReq) =>
  api.post('jshop-goods/api/v1/goods', { json: req })
