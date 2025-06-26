import { api } from '@/lib'
import { ApiResponse, PaginatedReq, Pagination } from '../types'

export const LiveStatus = {
  未开播: 4,
  直播中: 1,
  回放: 2,
  断流中: 3
} as const
export type LiveStatus = (typeof LiveStatus)[keyof typeof LiveStatus]

export type GetLiveListReq = {
  name?: string
  status?: LiveStatus
  department_id: number
} & PaginatedReq

export type GetLiveListRes = Partial<{
  channel_id: number
  cover: string
  created_at: number
  department_id: number
  duration: number
  end_time: number
  id: number
  live_at: string
  live_style: number
  name: string
  popular: number
  real_pv: number
  start_time: number
  status: number
  ticket_id: string
}>

export const getLiveList = (req: GetLiveListReq) =>
  api
    .get<
      ApiResponse<{
        list: GetLiveListRes[]
        paginate: Pagination
      }>
    >('jshop-market/api/v1/live-list', {
      searchParams: req
    })
    .json()
    .then((res) => res.result)
