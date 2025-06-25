import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/coupon/data')({
  component: CouponDataView
})

function CouponDataView() {
  return <div>Hello "/_protected/marketing/coupon/data"!</div>
}
