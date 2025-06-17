import { api } from '@/lib'

import { ApiResponse } from '../types'

export type GetCustomerInfoReq = {
  id: number
  department: number
}

export type GetCustomerInfoRes = Partial<{
  nickname: string // 昵称
  mobile: string // 手机号
  source: string // 客户来源
  identity: string // 客户身份
  distributors: string // 分销员
  superior_distributors: string // 上级分销员
  ctime: number // 创建时间，时间戳
  address: string // 地址
  browsing_ctime: number // 浏览时间，时间戳
  label: string // 标签
  avatar: string // 头像 URL
}>

export const getCustomerInfo = (req: GetCustomerInfoReq) =>
  api
    .get<ApiResponse<GetCustomerInfoRes>>('jshop-user/api/v1/user-info', {
      searchParams: req
    })
    .json()
    .then((res) => res.result)
