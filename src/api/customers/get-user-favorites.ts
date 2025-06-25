import { api } from '@/lib'

import { PaginatedReq, PaginatedResponse } from '../types'

export type GetUserFavoritesReq = {
  user_id: number
  start_time?: number
  end_time?: number
  goods_name?: string
} & PaginatedReq

export type GetUserFavoritesRes = Partial<{
  id: number
  user_id: number
  goods_id: number
  goods_name: string
  goods_url: string
  ctime: number
  type: number
}>

export const getUserFavorites = (req: GetUserFavoritesReq) =>
  api
    .get<PaginatedResponse<GetUserFavoritesRes>>(
      'jshop-user/api/v1/user-collection',
      {
        searchParams: req
      }
    )
    .json()
    .then((res) => res.result)
