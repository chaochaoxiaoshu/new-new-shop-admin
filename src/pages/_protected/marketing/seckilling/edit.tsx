import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/seckilling/edit')({
  component: EditSeckillingView
})

function EditSeckillingView() {
  return <div>Hello "/_protected/marketing/seckilling/edit"!</div>
}
