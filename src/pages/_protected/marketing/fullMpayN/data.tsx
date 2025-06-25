import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/fullMpayN/data')({
  component: FullMpayNDataView
})

function FullMpayNDataView() {
  return <div>Hello "/_protected/marketing/fullMpayN/data"!</div>
}
