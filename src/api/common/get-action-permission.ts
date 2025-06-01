import { api } from '@/lib/request'
import type { ApiResponse } from '../types'

export type ActionPermissionItem = {
  id: number
  name: string
  front_path: string
  front_secret: string
}

export type GetActionPermissionRes = Partial<{
  items: ActionPermissionItem[]
}>

export const getActionPermission = async () => {
  const res = await api
    .get<ApiResponse<GetActionPermissionRes>>('jshop-user/api/v1/users-button')
    .json()

  return res.result
}
