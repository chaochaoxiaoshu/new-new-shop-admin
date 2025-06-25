import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/piece/data')({
  component: PieceDataView
})

function PieceDataView() {
  return <div>Hello "/_protected/marketing/piece/data"!</div>
}
