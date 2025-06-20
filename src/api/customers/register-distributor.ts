import { api } from '@/lib'

export type RegisterDistributorReq = {
  mobile: string
}

export const registerDistributor = (req: RegisterDistributorReq) =>
  api.post('jshop-user/api/v1/user-distributors', { json: req })
