import { createFileRoute } from '@tanstack/react-router'
import {PageCreateConversation} from '@/pages/PageConversations'
export const Route = createFileRoute('/route-conversation-new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PageCreateConversation/>
}
