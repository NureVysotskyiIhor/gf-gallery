import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useUserStore } from "@/store/userStore";
import PageCompleteProfileForm from '@/pages/PageCompleteProfileForm'
import { useEffect } from "react";

export const Route = createFileRoute('/route-complete-profile')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate({ to: "/" });
    }
  }, [user, navigate]);

  if (!user) {
    return <PageCompleteProfileForm />;
  }

  return null;
}
