import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/teambuy/edit')({
  component: EditTeambuyView
})

function EditTeambuyView() {
  return <div>Hello "/_protected/marketing/teambuy/edit"!</div>
}
