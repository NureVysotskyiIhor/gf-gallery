//src\components\ThemeSwitcher.tsx
import { useEffect, useState } from "react";
import { Moon, Sun, Laptop, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ThemeType = "dark" | "light" | "system";

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState<ThemeType>("system");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as ThemeType | null;

    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
      document.documentElement.classList.toggle("dark", storedTheme === "dark");
    } else {
      setTheme("system");
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      document.documentElement.classList.toggle("dark", systemPrefersDark);
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        document.documentElement.classList.toggle("dark", mediaQuery.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const updateTheme = (newTheme: ThemeType) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    if (newTheme === "system") {
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      document.documentElement.classList.toggle("dark", systemPrefersDark);
    } else {
      document.documentElement.classList.toggle("dark", newTheme === "dark");
    }
    setIsOpen(false);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "dark":
        return <Moon className="w-4 h-4" />;
      case "light":
        return <Sun className="w-4 h-4" />;
      default:
        return <Laptop className="w-4 h-4" />;
    }
  };

  const themes = [
    {
      key: "light" as ThemeType,
      icon: <Sun className="w-4 h-4" />,
      label: "Light",
      gradient: "hover:from-amber-50/80 hover:to-orange-50/80 dark:hover:from-amber-900/20 dark:hover:to-orange-900/20",
      iconColor: "group-hover:text-amber-600 dark:group-hover:text-amber-400"
    },
    {
      key: "dark" as ThemeType,
      icon: <Moon className="w-4 h-4" />,
      label: "Dark",
      gradient: "hover:from-indigo-50/80 hover:to-purple-50/80 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20",
      iconColor: "group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
    },
    {
      key: "system" as ThemeType,
      icon: <Laptop className="w-4 h-4" />,
      label: "System",
      gradient: "hover:from-gray-50/80 hover:to-slate-50/80 dark:hover:from-gray-900/20 dark:hover:to-slate-900/20",
      iconColor: "group-hover:text-gray-600 dark:group-hover:text-gray-400"
    }
  ];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="group relative w-9 h-9 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 hover:border-blue-200/60 dark:hover:border-blue-500/30 hover:shadow-lg transition-all duration-300 hover:scale-105 rounded-full"
        >
          <div className="relative z-10 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {getThemeIcon()}
          </div>
          
          {/* Dynamic glow effect based on current theme */}
          <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
            theme === "light" 
              ? "bg-gradient-to-br from-amber-400/10 to-orange-400/10" 
              : theme === "dark"
              ? "bg-gradient-to-br from-indigo-400/10 to-purple-400/10"
              : "bg-gradient-to-br from-gray-400/10 to-slate-400/10"
          }`}></div>
          
          {/* Rotating border effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
          
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-white/20 dark:border-gray-700/50 shadow-xl rounded-xl p-1 animate-in fade-in-0 zoom-in-95 duration-200 min-w-[140px]"
      >
        {themes.map((themeOption) => (
          <DropdownMenuItem 
            key={themeOption.key}
            onClick={() => updateTheme(themeOption.key)}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gradient-to-r ${themeOption.gradient} transition-all duration-200 cursor-pointer`}
          >
            <div className={`text-gray-500 dark:text-gray-400 ${themeOption.iconColor} transition-colors duration-200`}>
              {themeOption.icon}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200">
              {themeOption.label}
            </span>
            {theme === themeOption.key && (
              <div className="ml-auto flex items-center">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  themeOption.key === "light" 
                    ? "bg-gradient-to-r from-amber-500 to-orange-500" 
                    : themeOption.key === "dark"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                    : "bg-gradient-to-r from-gray-500 to-slate-500"
                }`}></div>
              </div>
            )}
          </DropdownMenuItem>
        ))}
        
        {/* Decorative element */}
        <div className="mx-2 mt-1 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
        <div className="px-3 py-1 text-center">
          <Palette className="w-3 h-3 text-gray-400 dark:text-gray-500 mx-auto opacity-60" />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;