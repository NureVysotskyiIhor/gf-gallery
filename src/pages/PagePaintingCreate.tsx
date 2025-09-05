//src\pages\PagePaintingCreate.tsx
import { CompPaintingCreate } from "@/components/compPaintingCreate";
import { useUserStore } from '@/store/userStore';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {  useNavigate } from '@tanstack/react-router';

export default function PagePaintingCreate() {
  const { user } = useUserStore();
  const navigate = useNavigate();
  if (!user  || user.role_id === 1) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/80 via-emerald-50/80 to-teal-50/50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/30 relative overflow-hidden">
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-green-100/80 to-emerald-100/80 dark:from-green-800/20 dark:to-emerald-800/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Plus className="w-12 h-12 text-green-700 dark:text-green-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Требуется авторизация как автор
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Пожалуйста, войдите в систему как автор для доступа к созданию картин
          </p>
          <Button
            onClick={() => navigate({ to: "/" })}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться на главную
          </Button>
        </div>
      </div>
    </div>
  );
}

return <CompPaintingCreate />;
}
