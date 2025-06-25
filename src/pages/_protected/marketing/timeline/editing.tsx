import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/timeline/editing')({
  component: EditTimelineView
})

function EditTimelineView() {
  return <div>Hello "/_protected/marketing/timeline/editing"!</div>
}
