import { api } from '@/lib'

export type ReplyCommentReq = {
  id: number
  seller_content: string
}

export const replyComment = (req: ReplyCommentReq) =>
  api.put(`jshop-goods/api/v1/goods-comment-save/${req.id}`, { json: req })
