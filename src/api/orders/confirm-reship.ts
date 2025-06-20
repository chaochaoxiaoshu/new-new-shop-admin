import { api } from '@/lib'

export type ConfirmReshipReq = {
  reship_id: string
}

export const confirmReship = (req: ConfirmReshipReq) =>
  api.get(`jshop-order/api/v1/reship-confirm/${req.reship_id}`)
