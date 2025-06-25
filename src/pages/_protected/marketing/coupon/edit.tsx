import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/coupon/edit')({
  component: EditCouponView
})

function EditCouponView() {
  return <div>Hello "/_protected/marketing/coupon/edit"!</div>
}
