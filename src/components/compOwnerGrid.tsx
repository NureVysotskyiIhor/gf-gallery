import { useEffect } from "react"
import { usePaintingListStore } from "@/store/paintingListStore"
import { Pencil, Plus } from "lucide-react"
import { DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CompPaintingCardGridProfile } from "./compPaintingCardGridProfile"
import { CompPaintingEditDialog } from "./compPaintingEditDialog"
import { useNavigate } from "@tanstack/react-router"

export function CompOwnerGrid({ userId }: { userId: string }) {
  const paintingsByOwner = usePaintingListStore((s) => s.paintingsByOwner)
  const loadingOwner = usePaintingListStore((s) => s.loadingOwner)
  const fetchPaintingsByOwner = usePaintingListStore((s) => s.fetchPaintingsByOwner)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPaintingsByOwner(userId)
  }, [userId, fetchPaintingsByOwner])

  if (loadingOwner) return <p>Загрузка моих картин…</p>

  return (
    <div>
      <h2 className="text-2xl mb-4">Мои картины</h2>

      {/* фильтры-пустышки */}
      <div className="flex gap-2 mb-4">
        <Button size="sm">Все</Button>
        <Button size="sm">Активные</Button>
        <Button size="sm">Продано</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {paintingsByOwner.map((p) => (
          <CompPaintingEditDialog
            key={p.id}
            painting={p}
            onFinish={() => fetchPaintingsByOwner(userId)}
          >
            <CompPaintingCardGridProfile
              painting={p}
              actionButton={
                <DialogTrigger asChild>
                  <Button size="icon" variant="secondary">
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DialogTrigger>
              }
            />
          </CompPaintingEditDialog>
        ))}

        {/* Кнопка "Добавить картину" в стиле карточки */}
        <Card
          onClick={() => navigate({ to: "/route-painting-create" })}
          className="overflow-hidden rounded-xl shadow cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <div className="w-full h-48 flex items-center justify-center bg-gray-100">
            <Plus className="w-8 h-8 text-gray-500" />
          </div>
          <CardContent className="p-4 flex justify-center">
            <p className="text-sm text-gray-600 font-medium">
              Добавить картину
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
