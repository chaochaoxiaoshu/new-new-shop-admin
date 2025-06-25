import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/fulldiscounts/')({
  component: FullDiscountsView
})

function FullDiscountsView() {
  return <div>Hello "/_protected/marketing/fulldiscounts/"!</div>
}
