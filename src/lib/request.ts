import ky from 'ky'

import { redirect } from '@tanstack/react-router'

import { useUserStore } from '../stores/user-store'

export const unprotectedApi = ky.create({
  prefixUrl: import.meta.env.DEV ? '/api' : 'https://shop.shanshu.work'
})

export const api = unprotectedApi.extend(() => {
  return {
    hooks: {
      beforeRequest: [
        (request) => {
          const token = useUserStore.getState().token
          if (token) {
            request.headers.set('Authorization', `Bearer ${token}`)
          }
        }
      ],
      afterResponse: [
        async (_request, _options, response) => {
          if (response.status === 401) {
            useUserStore.getState().logout()
            redirect({
              to: '/login',
              search: { redirect: location.href.replace('/newmanage', '') }
            })
            throw new Error('Unauthorized')
          }
          const cloned = response.clone()
          const data: { result: { errcode: number; errmsg: string } } =
            await cloned.json()
          if (data.result?.errcode === 401) {
            useUserStore.getState().logout()
            redirect({
              to: '/login',
              search: { redirect: location.href.replace('/newmanage', '') }
            })
            throw new Error('Unauthorized')
          }
          return response
        }
      ]
    }
  }
})
