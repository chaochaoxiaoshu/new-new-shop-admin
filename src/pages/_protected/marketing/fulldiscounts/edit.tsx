import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/marketing/fulldiscounts/edit'
)({
  component: EditFullDiscountsView
})

function EditFullDiscountsView() {
  return <div>Hello "/_protected/marketing/fulldiscounts/edit"!</div>
}
