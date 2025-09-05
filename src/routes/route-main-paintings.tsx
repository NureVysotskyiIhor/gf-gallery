import { createFileRoute } from '@tanstack/react-router'
import PageMainPaintings from '@/pages/PageMainPaintings'

export const Route = createFileRoute('/route-main-paintings')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PageMainPaintings/>
}
