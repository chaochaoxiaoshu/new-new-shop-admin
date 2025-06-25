import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/order/')({
  component: OrdersView
})

function OrdersView() {
  return <div>Hello "/_protected/order/"!</div>
}
