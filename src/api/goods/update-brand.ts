import { api } from '@/lib'

export type UpdateBrandReq = {
  brand_id?: number
  name?: string
  logo?: string
  logo_url?: string
  sort?: number
}

export const updateBrand = (req: UpdateBrandReq) =>
  api.put(`jshop-goods/api/v1/brand/${req.brand_id}`, {
    json: {
      name: req.name,
      logo: req.logo,
      sort: req.sort
    }
  })
