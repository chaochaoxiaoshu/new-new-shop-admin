import { api } from '@/lib'

export type BindDistributorReq = {
  id: number
  user_id: number
}

export const bindDistributor = (req: BindDistributorReq) =>
  api.put('jshop-user/api/v1/user-distributors/binduser', { json: req })
