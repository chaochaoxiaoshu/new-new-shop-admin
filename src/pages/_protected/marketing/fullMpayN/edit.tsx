import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/fullMpayN/edit')({
  component: EditFullMpayNView
})

function EditFullMpayNView() {
  return <div>Hello "/_protected/marketing/fullMpayN/edit"!</div>
}
