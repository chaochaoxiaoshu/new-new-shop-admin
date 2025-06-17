import { api } from '@/lib'

export type SetCustomerTagsReq = {
  tag_id: number[]
  user_id: number
}

export const setCustomerTags = (req: SetCustomerTagsReq) =>
  api.post('jshop-user/api/v1/user-tag-set', { json: req })
