// __root.tsx
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Header } from "@/components/Header";
import { useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
import { useNavigate } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import PageNotFound from '@/pages/PageNotFound'
function RootComponent() {
  const navigate = useNavigate();
  const { initializeAuth, loading, isInitialized } = useUserStore();

  useEffect(() => {
    // Инициализируем авторизацию только один раз при запуске
    if (!isInitialized) {
      console.log('Root: Initializing auth...');
      initializeAuth(navigate);
    }
  }, [initializeAuth, navigate, isInitialized]);

  // Показываем загрузку только пока инициализируется
  if (loading && !isInitialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div>Загрузка приложения...</div>
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <Outlet />
      <TanStackRouterDevtools />
      <Toaster richColors position="top-right" />
    </>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: PageNotFound,
});