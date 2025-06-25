import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/live/edit')({
  component: EditLiveView
})

function EditLiveView() {
  return <div>Hello "/_protected/marketing/live/edit"!</div>
}
