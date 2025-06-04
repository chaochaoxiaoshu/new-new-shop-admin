import { api } from '@/lib'

export type UpdateGoodsMarketableReq = {
  id: number
  marketable: 1 | 2
}

export type UpdateGoodsMarketableRes = null

export const updateGoodsMarketable = (req: UpdateGoodsMarketableReq) =>
  api.put('jshop-goods/api/v1/goods-change', {
    json: req
  })
