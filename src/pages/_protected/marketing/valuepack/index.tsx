import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/valuepack/')({
  component: ValuepackView
})

function ValuepackView() {
  return <div>Hello "/_protected/marketing/valuepack/"!</div>
}
