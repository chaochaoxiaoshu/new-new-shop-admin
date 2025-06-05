import dayjs from 'dayjs'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { ActionPermissionItem } from '@/api'

type UserStoreState = {
  token: string | null
  expiredAt: number | null
  departmentId: number | null
  username: string | null
  actionButtonList: ActionPermissionItem[] | null
  /**
   * 当前是否已登录
   */
  isAuthenticated: () => boolean
}

type UserStoreActions = {
  login: ({
    token,
    expiredAt,
    departmentId,
    username
  }: {
    token: string
    expiredAt: number
    departmentId: number
    username: string
  }) => void
  logout: () => void
  setActionButtonList: (val: UserStoreState['actionButtonList']) => void
  /**
   * 根据给定的 path 判断当前用户是否拥有某个 ActionButton 的权限
   */
  checkActionPermisstion: (path: string) => boolean
}

export const useUserStore = create<UserStoreState & UserStoreActions>()(
  persist(
    (set, get) => ({
      token: null,
      expiredAt: null,
      departmentId: null,
      username: null,
      actionButtonList: null,
      isAuthenticated: () => {
        if (!get().token || !get().expiredAt) return false
        if (dayjs().unix() > get().expiredAt!) return false
        return true
      },
      login: ({ token, expiredAt, departmentId, username }) =>
        set({ token, expiredAt, departmentId, username }),
      logout: () =>
        set({
          token: null,
          expiredAt: null,
          departmentId: null,
          username: null
        }),
      setActionButtonList: (val) => set({ actionButtonList: val }),
      checkActionPermisstion: (path) =>
        get().actionButtonList?.some((item) => item.front_path === path) ??
        false
    }),
    {
      name: 'shop-admin-user-store',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
