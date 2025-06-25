import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/marketing/coupon/targeted-distribution'
)({
  component: TargetedDistributionView
})

function TargetedDistributionView() {
  return <div>Hello "/_protected/marketing/coupon/targeted-distribution"!</div>
}
