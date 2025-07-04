import { api } from '@/lib'

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

export const getActionPermission = () =>
  api
    .get<ApiResponse<GetActionPermissionRes>>('jshop-user/api/v1/users-button')
    .json()
    .then((res) => res.result)
