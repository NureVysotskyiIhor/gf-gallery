import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Header } from "@/components/Header";
import { useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
import { useNavigate } from '@tanstack/react-router';

function RootComponent(){
  const navigate = useNavigate();
  const fetchUser = useUserStore((state) => state.fetchUser);
    useEffect(() => {
    fetchUser(navigate);
  }, []);
  return (
    <>
      <Header />
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{" "}
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});