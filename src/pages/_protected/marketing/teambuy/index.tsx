import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/teambuy/')({
  component: TeambuyView
})

function TeambuyView() {
  return <div>Hello "/_protected/marketing/teambuy/"!</div>
}
