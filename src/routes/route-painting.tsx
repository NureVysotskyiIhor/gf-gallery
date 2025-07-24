import { createFileRoute, useSearch } from '@tanstack/react-router'
import PagePainting from '@/pages/PagePainting'
export const Route = createFileRoute('/route-painting')({
    validateSearch: (search: Record<string, unknown>) => {
        if (typeof search.paintingId !== "number") {
        throw new Error("Missing or invalid 'propertyId'");
        }
        return {
        paintingId: search.paintingId,
        };
    },
    component: RouteComponent,
})

function RouteComponent() {
    const search = useSearch({ from: "/route-painting" });
  return <PagePainting paintingId={search.paintingId}/>
}
