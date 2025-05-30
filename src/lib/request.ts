import ky from 'ky'
import { useUserStore } from '../stores/user-store'
import { redirect } from '@tanstack/react-router'

export const unprotectedApi = ky.create({
  prefixUrl: import.meta.env.DEV ? '/api' : 'https://shop.shanshu.work',
})

export const api = unprotectedApi.extend(() => {
  const token = useUserStore.getState().token

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    hooks: {
      afterResponse: [
        async (_request, _options, response) => {
          if (response.status === 401) {
            useUserStore.getState().logout()
            redirect({
              to: '/login',
              search: { redirect: location.href.replace('/newmanage', '') },
            })
            throw new Error('Unauthorized')
          }
          const cloned = response.clone()
          const data: { result: { errcode: number } } = await cloned.json()
          if (data.result?.errcode === 401) {
            useUserStore.getState().logout()
            redirect({
              to: '/login',
              search: { redirect: location.href.replace('/newmanage', '') },
            })
            throw new Error('Unauthorized')
          }
          return response
        },
      ],
    },
  }
})
