import { api } from '@/lib'

export type ToggleCommentVisibilityReq = {
  id: number
}

export const toggleCommentVisibility = (req: ToggleCommentVisibilityReq) =>
  api.put(`jshop-goods/api/v1/goods-comment/${req.id}`, { json: {} })
