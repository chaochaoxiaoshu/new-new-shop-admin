import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/client/clientTags/edit')({
  component: RouteComponent
})

function RouteComponent() {
  return <div>Hello "/_protected/client/clientTags/edit"!</div>
}
