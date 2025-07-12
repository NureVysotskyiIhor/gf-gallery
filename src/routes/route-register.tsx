import { createFileRoute } from '@tanstack/react-router'
import PageRegister from '@/pages/PageRegister'
export const Route = createFileRoute('/route-register')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PageRegister/>
}
