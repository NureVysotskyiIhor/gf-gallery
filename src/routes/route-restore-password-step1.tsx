import { createFileRoute } from '@tanstack/react-router'
import PageRestorePasswordStep1 from '@/pages/PageRestorePasswordStep1'

export const Route = createFileRoute('/route-restore-password-step1')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PageRestorePasswordStep1/>
}
