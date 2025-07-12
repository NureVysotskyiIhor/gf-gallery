import { createFileRoute } from '@tanstack/react-router'
import PageLogin from '@/pages/PageLogin'
export const Route = createFileRoute('/route-login')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PageLogin/>
}
