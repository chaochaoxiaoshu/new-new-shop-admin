import { api } from '@/lib'

export type UnregisterDistributorReq = {
  id: number
}

export const unregisterDistributor = (req: UnregisterDistributorReq) =>
  api.delete(`jshop-user/api/v1/user-distributors/deluser/${req.id}`)
