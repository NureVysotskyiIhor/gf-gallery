import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useUserStore } from "@/store/userStore";
import PageRestorePasswordStep2 from '@/pages/PageRestorePasswordStep1'

export const Route = createFileRoute('/route-restore-password-step2')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useUserStore();
  const navigate = useNavigate();
  if (!user) {
    return <PageRestorePasswordStep2/>;
  } else {
    navigate({ to: "/" });
  }
}