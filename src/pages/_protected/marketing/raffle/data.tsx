import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/raffle/data')({
  component: RaffleDataView
})

function RaffleDataView() {
  return <div>Hello "/_protected/marketing/raffle/data"!</div>
}
