import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/drp/data')({
  component: DistrDataView
})

function DistrDataView() {
  return <div>Hello "/_protected/marketing/drp/data"!</div>
}
