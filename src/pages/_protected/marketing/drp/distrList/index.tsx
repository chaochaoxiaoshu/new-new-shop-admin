import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/drp/distrList/')({
  component: DistrListView
})

function DistrListView() {
  return <div>Hello "/_protected/marketing/drp/distrList/"!</div>
}
