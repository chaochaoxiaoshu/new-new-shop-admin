import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/drp/distrHistory')({
  component: DistrHistoryView
})

function DistrHistoryView() {
  return <div>Hello "/_protected/marketing/drp/distrHistory"!</div>
}
