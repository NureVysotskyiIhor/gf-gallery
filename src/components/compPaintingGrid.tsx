import { useEffect } from "react"
import { usePaintingListStore } from "@/store/paintingListStore"
import { CompPaintingCardMainPage } from "./compPaintingCardMainPage"

export function CompPaintingGrid() {
  const {
    publicPaintings,
    loadingPublic,
    fetchPublicPaintings,
  } = usePaintingListStore()

  useEffect(() => {
    fetchPublicPaintings()
  }, [fetchPublicPaintings])

  if (loadingPublic) return <div>Загрузка картин...</div>
  if (publicPaintings.length === 0) return <div>Ничего не найдено</div>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {publicPaintings.map((p) => (
        <CompPaintingCardMainPage key={p.id} painting={p} />
      ))}
    </div>
  )
}
