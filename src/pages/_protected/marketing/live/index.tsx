import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/live/')({
  component: LiveView
})

function LiveView() {
  return <div>Hello "/_protected/marketing/live/"!</div>
}
