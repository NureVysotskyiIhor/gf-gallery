import { createFileRoute } from '@tanstack/react-router'
import PagePaintingCreate from '@/pages/PagePaintingCreate'

export const Route = createFileRoute('/route-painting-create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PagePaintingCreate/>
}
