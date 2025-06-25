import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/fullMpayN/')({
  component: FullMpayNView
})

function FullMpayNView() {
  return <div>Hello "/_protected/marketing/fullMpayN/"!</div>
}
