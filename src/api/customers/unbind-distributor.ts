import { api } from '@/lib'

export type UnbindDistributorReq = {
  id: number
}

export const unbindDistributor = (req: UnbindDistributorReq) =>
  api.put('jshop-user/api/v1/user-distributors/unbinding', { json: req })
