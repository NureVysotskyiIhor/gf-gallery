import { createFileRoute } from '@tanstack/react-router'
import PageCompleteProfileForm from '@/pages/PageCompleteProfileForm'

export const Route = createFileRoute('/route-complete-profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PageCompleteProfileForm/>
}
