import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/seckilling/')({
  component: SeckillingView
})

function SeckillingView() {
  return <div>Hello "/_protected/marketing/seckilling/"!</div>
}
