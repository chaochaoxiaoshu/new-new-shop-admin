import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/valuepack/edit')({
  component: EditValuepackView
})

function EditValuepackView() {
  return <div>Hello "/_protected/marketing/valuepack/edit"!</div>
}
