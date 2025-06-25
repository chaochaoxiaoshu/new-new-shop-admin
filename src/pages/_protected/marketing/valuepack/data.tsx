import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/valuepack/data')({
  component: ValuepackDataView
})

function ValuepackDataView() {
  return <div>Hello "/_protected/marketing/valuepack/data"!</div>
}
