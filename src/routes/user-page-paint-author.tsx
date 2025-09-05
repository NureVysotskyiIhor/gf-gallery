import { createFileRoute, useSearch  } from '@tanstack/react-router'
import PageUserFromPainting from '@/pages/PageUserFromPainting';
export const Route = createFileRoute('/user-page-paint-author')({
validateSearch: (search: Record<string, unknown>) => {
  if (typeof search.userId !== 'string') {
    throw new Error("Missing or invalid 'userId' in search params");
  }
  return {
    userId: search.userId,
  };
},
  component: RouteComponent,
})

function RouteComponent() {
  const search = useSearch({ from: '/user-page-paint-author' });
  return <PageUserFromPainting userId= {search.userId} />
}
