import { createFileRoute } from '@tanstack/react-router'
import PageRestorePasswordStep2 from '@/pages/PageRestorePasswordStep2'

export const Route = createFileRoute('/route-restore-password-step2')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PageRestorePasswordStep2/>
}
