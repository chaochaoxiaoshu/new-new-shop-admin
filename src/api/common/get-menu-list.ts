import { api } from '@/lib/request'
import type { ApiResponse } from '../types'

export type MenuItemData = {
  id: number
  parent_id: number
  path: string
  name: string
  menu_type: number
  depth: number
  children: MenuItemData[]
}

export type GetMenuListRes = Partial<{
  items: MenuItemData[]
}>

export const getMenuList = () =>
  api
    .get<ApiResponse<GetMenuListRes>>('jshop-user/api/v1/manage-menu')
    .json()
    .then((res) => res.result)
