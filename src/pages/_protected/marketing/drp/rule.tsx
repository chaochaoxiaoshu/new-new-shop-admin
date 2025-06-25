import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/marketing/drp/rule')({
  component: DistrRuleView
})

function DistrRuleView() {
  return <div>Hello "/_protected/marketing/drp/rule"!</div>
}
