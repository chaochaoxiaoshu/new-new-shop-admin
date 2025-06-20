import { api } from '@/lib'

export type UpdateBillLadingRea = {
  id: string
  name: string
  store_id: number
  mobile: string
}

export const updateBillLading = (req: UpdateBillLadingRea) =>
  api.put(`jshop-order/api/v1/bill-lading/${req.id}`, { json: req })
