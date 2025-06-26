import { api } from '@/lib'
import { PaginatedReq, PaginatedResponse } from '../types'

export type GetTimelinesReq = {
  task_name?: string
  goods_name?: string
  status?: number
  with_fields?: 'images'
  department_id: number
} & PaginatedReq

export type GetTimelinesRes = Partial<{
  id: number
  task_name: string
  task_content: string
  goods_id: number
  goods_name: string
  sticky: number
  publish_status: number
  creator_name: string
  poster_type: number
  poster_goods_id: number
  publish_time: number
  update_time: number
  create_time: number
  push_type: number
  push_time: number
  share_num: number
  department_id: number
  images: {
    image_id: number
    task_id: number
    img_url: string
    type: number
    ctime: number
  }[]
  html_content: string
}>

export const getTimelines = (req: GetTimelinesReq) =>
  api
    .get<PaginatedResponse<GetTimelinesRes>>(
      'jshop-goods/api/v1/moments-task-list',
      { searchParams: req }
    )
    .json()
    .then((res) => res.result)
