import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/raffle/edit')({
  component: EditRaffleView
})

function EditRaffleView() {
  return <div>Hello "/_protected/marketing/raffle/edit"!</div>
}
