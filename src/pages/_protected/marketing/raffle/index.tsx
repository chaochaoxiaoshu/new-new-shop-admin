import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/raffle/')({
  component: RaffleView
})

function RaffleView() {
  return <div>Hello "/_protected/marketing/raffle/"!</div>
}
