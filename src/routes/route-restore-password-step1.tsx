import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useUserStore } from "@/store/userStore";
import PageRestorePasswordStep1 from '@/pages/PageRestorePasswordStep1'

export const Route = createFileRoute('/route-restore-password-step1')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useUserStore();
  const navigate = useNavigate();
  if (!user) {
    return <PageRestorePasswordStep1/>;
  } else {
    navigate({ to: "/" });
  }
}
