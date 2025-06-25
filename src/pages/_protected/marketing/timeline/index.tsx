import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/timeline/')({
  component: TimelineView
})

function TimelineView() {
  return <div>Hello "/_protected/marketing/timeline/"!</div>
}
