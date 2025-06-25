import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/order/afterSale')({
  component: AfterSalesView
})

function AfterSalesView() {
  return <div>Hello "/_protected/order/afterSale"!</div>
}
