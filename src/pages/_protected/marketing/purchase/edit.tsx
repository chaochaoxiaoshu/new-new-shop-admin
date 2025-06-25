import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/purchase/edit')({
  component: EditPurchaseView
})

function EditPurchaseView() {
  return <div>Hello "/_protected/marketing/purchase/edit"!</div>
}
