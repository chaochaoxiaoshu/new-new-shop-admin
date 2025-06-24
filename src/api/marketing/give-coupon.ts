import { api } from '@/lib'

export type GiveCouponReq = {
  user_id: number
  id: number
}

export const giveCoupon = (req: GiveCouponReq) =>
  api.post('jshop-market/api/v1/discount/setup-user', { json: req })
