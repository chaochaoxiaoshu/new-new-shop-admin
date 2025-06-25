import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/reduction/data')({
  component: ReductionDataView
})

function ReductionDataView() {
  return <div>Hello "/_protected/marketing/reduction/data"!</div>
}
