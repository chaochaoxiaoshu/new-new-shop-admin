import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/reduction/')({
  component: ReductionView
})

function ReductionView() {
  return <div>Hello "/_protected/marketing/reduction/"!</div>
}
