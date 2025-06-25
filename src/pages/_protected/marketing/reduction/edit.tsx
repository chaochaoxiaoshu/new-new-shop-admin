import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/reduction/edit')({
  component: EditReductionView
})

function EditReductionView() {
  return <div>Hello "/_protected/marketing/reduction/edit"!</div>
}
