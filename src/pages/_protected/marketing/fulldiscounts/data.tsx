import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/marketing/fulldiscounts/data'
)({
  component: FullDiscountsDataView
})

function FullDiscountsDataView() {
  return <div>Hello "/_protected/marketing/fulldiscounts/data"!</div>
}
