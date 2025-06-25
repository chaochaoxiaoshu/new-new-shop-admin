import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/drp/userIndex')({
  component: DistrUserIndexView
})

function DistrUserIndexView() {
  return <div>Hello "/_protected/marketing/drp/userIndex"!</div>
}
