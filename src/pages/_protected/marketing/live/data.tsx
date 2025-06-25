import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/live/data')({
  component: DataLiveView
})

function DataLiveView() {
  return <div>Hello "/_protected/marketing/live/data"!</div>
}
