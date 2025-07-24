// src/components/compFavoritesGrid.tsx
import { useEffect } from "react"
import { usePaintingListStore } from "@/store/paintingListStore"
import { HeartMinus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CompPaintingCardGridProfile } from "./compPaintingCardGridProfile"

export function CompFavoritesGrid({ userId }: { userId: string }) {
  const {
    favoritePaintings,
    loadingFavorites,
    fetchFavoritePaintings,
    toggleFavorite,
  } = usePaintingListStore()

  useEffect(() => {
    fetchFavoritePaintings(userId)
  }, [userId, fetchFavoritePaintings])

  if (loadingFavorites) return <p>Загрузка избранного…</p>

  return (
    <div>
      <h2 className="text-2xl mb-4">Избранные картины</h2>

      {/* фильтры-пустышки */}
      <div className="flex gap-2 mb-4">
        <Button size="sm">Все</Button>
        <Button size="sm">Для продажи</Button>
        <Button size="sm">Продано</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {favoritePaintings.map((p) => (
          <CompPaintingCardGridProfile
            key={p.id}
            painting={p}
            actionButton={
              <Button
                size="icon"
                variant="secondary"
                onClick={() => toggleFavorite(userId, p.id)}
              >
                <HeartMinus className="w-4 h-4 text-red-500" />
              </Button>
            }
          />
        ))}
      </div>
    </div>
  )
}
