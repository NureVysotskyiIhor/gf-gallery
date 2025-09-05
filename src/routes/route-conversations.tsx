import { createFileRoute } from '@tanstack/react-router'
import PageConversations from '@/pages/PageConversations'
export const Route = createFileRoute('/route-conversations')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PageConversations/>
}
