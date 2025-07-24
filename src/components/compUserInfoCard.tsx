// src\components\compUserInfoCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { useState } from "react";
import { CompUserEditDialog} from "./compUserEditDialog"; // импорт компонента
import { Button } from "./ui/button";
import type { ExtendedUser } from "@/lib/types/userTypes"

export function CompUserInfoCard({ user }: { user: ExtendedUser }) {
  const [openEdit, setOpenEdit] = useState(false);
  if (!user) return null;

  return (
    <Card className="max-w-xl mx-auto p-6 rounded-xl shadow-lg">
      <CardContent className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt="User avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl">👤</span>
          )}
        </div>

        <div className="flex-1 space-y-2 text-center sm:text-left">
          <h2 className="text-xl font-semibold">{user.username}</h2>
          <p className="text-muted-foreground">{user.email}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {user.bio || "Биография не указана"}
          </p>
          <div className="text-sm text-gray-500 mt-2">
            <p>
              Зарегистрирован:{" "}
              {user.created_at
                ? format(new Date(user.created_at), "dd MMM yyyy")
                : "н/д"}
            </p>
            <p>
              Обновлён:{" "}
              {user.updated_at
                ? format(new Date(user.updated_at), "dd MMM yyyy")
                : "н/д"}
            </p>
          </div>
          <Button onClick={() => setOpenEdit(true)}>Редактировать профиль</Button>
            <CompUserEditDialog open={openEdit} onOpenChange={setOpenEdit} />
        </div>
      </CardContent>
    </Card>
  );
}
