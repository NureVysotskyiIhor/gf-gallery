import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useUserStore } from "@/store/userStore";
import PageLogin from '@/pages/PageLogin'
export const Route = createFileRoute('/route-login')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useUserStore();
  const navigate = useNavigate();
  if (!user) {
    return <PageLogin/>;
  } else {
    navigate({ to: "/" });
  }
}
