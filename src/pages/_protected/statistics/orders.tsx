import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/statistics/orders')({
  component: RouteComponent
})

function RouteComponent() {
  return <div>Hello "/_protected/statistics/orders"!</div>
}
