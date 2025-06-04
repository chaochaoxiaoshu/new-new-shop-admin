import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/commodity/categoryAdmin/goods')({
  component: RouteComponent
})

function RouteComponent() {
  return <div>Hello "/_protected/commodity/categoryAdmin/goods"!</div>
}
