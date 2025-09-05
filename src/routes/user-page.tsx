import { createFileRoute, useNavigate } from "@tanstack/react-router";
import PageUser from "@/pages/PageUser";
import { useUserStore } from "@/store/userStore";

function RouteComponent() {
  const { user } = useUserStore();
  const navigate = useNavigate();

  if (user) {
    return <PageUser/>;
  } else {
    navigate({ to: "/route-register" });
  }
}

export const Route = createFileRoute("/user-page")({
  component: RouteComponent,
});
