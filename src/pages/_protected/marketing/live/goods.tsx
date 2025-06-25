import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/live/goods')({
  component: GoodsLiveView
})

function GoodsLiveView() {
  return <div>Hello "/_protected/marketing/live/goods"!</div>
}
