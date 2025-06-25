import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/purchase/')({
  component: PurchaseView
})

function PurchaseView() {
  return <div>Hello "/_protected/marketing/purchase/"!</div>
}
