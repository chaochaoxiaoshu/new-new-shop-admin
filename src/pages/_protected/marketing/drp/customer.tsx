import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/drp/customer')({
  component: DistrCustomerView
})

function DistrCustomerView() {
  return <div>Hello "/_protected/marketing/drp/customer"!</div>
}
