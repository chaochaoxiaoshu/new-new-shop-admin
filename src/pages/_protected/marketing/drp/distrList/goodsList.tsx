import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/marketing/drp/distrList/goodsList'
)({
  component: DistrGoodsListView
})

function DistrGoodsListView() {
  return <div>Hello "/_protected/marketing/drp/distrList/goodsList"!</div>
}
