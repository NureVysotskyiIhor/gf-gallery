import { createFileRoute } from '@tanstack/react-router'
import PageReviews from '@/pages/PageReviews'
export const Route = createFileRoute('/route-reviews')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PageReviews/>
}
