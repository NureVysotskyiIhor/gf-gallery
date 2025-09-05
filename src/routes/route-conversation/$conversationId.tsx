import { createFileRoute } from '@tanstack/react-router'
import { PageConversationChat } from '@/pages/PageConversations'

export const Route = createFileRoute('/route-conversation/$conversationId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PageConversationChat />
}
