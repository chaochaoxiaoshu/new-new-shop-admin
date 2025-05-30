import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/commodity/merchandiseCon/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected/commodity/merchandiseCon/"!</div>
}
