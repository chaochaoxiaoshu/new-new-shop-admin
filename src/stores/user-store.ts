import dayjs from 'dayjs'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type UserStoreState = {
  token: string | null
  expiredAt: number | null
  departmentId: number | null
  username: string | null
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
}

export const useUserStore = create<UserStoreState & UserStoreActions>()(
  persist(
    (set, get) => ({
      token: null,
      expiredAt: null,
      departmentId: null,
      username: null,
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
        })
    }),
    {
      name: 'shop-admin-user-store',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
