import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Globe, ChevronDown } from "lucide-react";
import "../i18n";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CompLanguageSwitcher = () => {
  const [language, setLanguage] = useState<string>("EN");
  const [isOpen, setIsOpen] = useState(false);

  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    setLanguage(lng.toUpperCase());
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  const languages = [
    { code: "en", label: "EN", flag: "🇺🇸" },
    { code: "ua", label: "UA", flag: "🇺🇦" }
  ];

  const currentLang = languages.find(lang => lang.label === language) || languages[0];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="group relative bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 hover:border-blue-200/60 dark:hover:border-blue-500/30 hover:shadow-lg transition-all duration-300 hover:scale-105 rounded-full px-3 py-2 h-9"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
              {currentLang.flag} {currentLang.label}
            </span>
            <ChevronDown className={`w-3 h-3 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {/* Subtle glow effect on hover */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/0 via-blue-400/5 to-purple-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-white/20 dark:border-gray-700/50 shadow-xl rounded-xl p-1 animate-in fade-in-0 zoom-in-95 duration-200"
      >
        {languages.map((lang) => (
          <DropdownMenuItem 
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-200 cursor-pointer"
          >
            <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200">
              {lang.flag} {lang.label}
            </span>
            {language === lang.label && (
              <div className="ml-auto w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CompLanguageSwitcher;