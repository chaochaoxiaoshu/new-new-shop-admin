import { api } from '@/lib'

export type AddBrandReq = {
  name?: string
  logo?: string
  logo_url?: string
  sort?: number
  department?: number
}

export const addBrand = (req: AddBrandReq) =>
  api.post('jshop-goods/api/v1/brand', {
    json: req
  })
