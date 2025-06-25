import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/teambuy/data')({
  component: TeambuyDataView
})

function TeambuyDataView() {
  return <div>Hello "/_protected/marketing/teambuy/data"!</div>
}
