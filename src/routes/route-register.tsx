import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useUserStore } from "@/store/userStore";
import PageRegister from '@/pages/PageRegister'
export const Route = createFileRoute('/route-register')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useUserStore();
  const navigate = useNavigate();
  if (!user) {
    return <PageRegister/>;
  } else {
    navigate({ to: "/" });
  }
}
