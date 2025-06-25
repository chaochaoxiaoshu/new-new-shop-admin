import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/piece/')({
  component: PieceView
})

function PieceView() {
  return <div>Hello "/_protected/marketing/piece/"!</div>
}
