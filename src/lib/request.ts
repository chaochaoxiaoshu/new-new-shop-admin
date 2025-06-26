import { redirect } from '@tanstack/react-router'
import ky, { KyRequest } from 'ky'
import { useUserStore } from '../stores/user-store'
import { cleanObject } from './utils'

export const unprotectedApi = ky.create({
  prefixUrl: import.meta.env.DEV ? '/api' : window.location.origin
})

export const api = unprotectedApi.extend(() => {
  return {
    hooks: {
      beforeRequest: [authHook, cleanRequestHook],
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
          const data = (await cloned.json()) as {
            errcode: number
            errmsg: string
            result: unknown
          }
          if (data.errcode === 401) {
            useUserStore.getState().logout()
            redirect({
              to: '/login',
              search: { redirect: location.href.replace('/newmanage', '') }
            })
            throw new Error('Unauthorized')
          }
          if (data.errcode !== 0) {
            throw new Error(data.errmsg)
          }
          return response
        }
      ]
    }
  }
})

function authHook(request: KyRequest) {
  const token = useUserStore.getState().token
  if (token) {
    request.headers.set('Authorization', `Bearer ${token}`)
  }
}

async function cleanRequestHook(request: KyRequest) {
  const method = request.method.toLowerCase()

  if (method === 'get' || method === 'head') {
    const url = new URL(request.url)
    const newUrl = new URL(url.origin + url.pathname)

    for (const [key, value] of url.searchParams.entries()) {
      if (
        value !== undefined &&
        value !== null &&
        value !== '' &&
        value !== 'null' &&
        value !== 'undefined'
      ) {
        if (value.includes(',')) {
          value.split(',').forEach((v) => {
            if (v !== undefined && v !== null && v !== '') {
              newUrl.searchParams.append(key, v)
            }
          })
        } else {
          newUrl.searchParams.append(key, value)
        }
      }
    }

    return new Request(newUrl.toString(), {
      method: request.method,
      headers: request.headers,
      mode: request.mode,
      credentials: request.credentials,
      cache: request.cache,
      redirect: request.redirect,
      referrer: request.referrer,
      integrity: request.integrity,
      signal: request.signal
    })
  } else {
    if (!request.body) return request
    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('application/json')) return request
    try {
      const body = await request.clone().json()
      const cleanBody = cleanObject(body)
      return new Request(request.url, {
        method: request.method,
        headers: request.headers,
        body: JSON.stringify(cleanBody),
        mode: request.mode,
        credentials: request.credentials,
        cache: request.cache,
        redirect: request.redirect,
        referrer: request.referrer,
        integrity: request.integrity,
        signal: request.signal
      })
    } catch (error) {
      console.error(error)
      return request
    }
  }
}
