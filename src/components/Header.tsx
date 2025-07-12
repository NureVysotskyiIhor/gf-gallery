import { useState } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { toast } from "sonner";
import logo from "@/assets/images/estateflow_logo.jpg";

export function Header() {
  // const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, setUser } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const { error } = await import("@/lib/supabaseClient").then(({ supabase }) =>
      supabase.auth.signOut()
    );

    if (error) {
      toast.error("Ошибка при выходе");
      return;
    }

    setUser(null);
    toast.success("Вы вышли из аккаунта");
    navigate({ to: "/" });
  };

  const isActiveLink = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Логотип */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-md">
              <img src={logo} alt="Logo" className="rounded-md" />
            </div>
            <h1 className="font-bold text-xl">Gallery</h1>
          </Link>

          {/* Правый блок */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link to="/">
                  <Button variant="ghost" size="icon">
                    <User className="w-5 h-5" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Выйти"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/route-login">
                  <Button variant="default" size="sm">
                    Войти
                  </Button>
                </Link>
                <Link to="/route-register">
                  <Button variant="outline" size="sm">
                    Регистрация
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
