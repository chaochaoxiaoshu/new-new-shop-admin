import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/piece/edit')({
  component: EditPieceView
})

function EditPieceView() {
  return <div>Hello "/_protected/marketing/piece/edit"!</div>
}
