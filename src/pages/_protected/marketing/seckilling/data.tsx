import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/seckilling/data')({
  component: SeckillingDataView
})

function SeckillingDataView() {
  return <div>Hello "/_protected/marketing/seckilling/data"!</div>
}
