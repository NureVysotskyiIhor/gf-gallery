import { useEffect } from 'react'
import { useUserStore } from '@/store/userStore'
import { usePaintingDetailStore } from "@/store/paintingDetailStore"
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Heart, HeartOff, Share2 } from 'lucide-react'
// import { Link } from '@tanstack/react-router' // если надо, раскомментируй

export function CompPaintingForm({ paintingId }: { paintingId: number }) {
  const { user } = useUserStore()
  const { isAuthenticated } = useAuthStore()

  const {
    painting,
    loading,
    isFavorite,
    fetchPainting,
    fetchFavorite,
    toggleFavorite,
  } = usePaintingDetailStore()

  useEffect(() => {
    fetchPainting(paintingId)
  }, [paintingId, fetchPainting])

  useEffect(() => {
    if (user && painting) {
      fetchFavorite(user.id, paintingId)
    }
  }, [user, painting, paintingId, fetchFavorite])

  if (loading) return <div>Загрузка...</div>
  if (!painting) return <div>Картина не найдена</div>

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      toast.error('Нужно войти', { description: 'Пожалуйста, войдите' })
      return
    }
    if (!user) return
    toggleFavorite(user.id, paintingId)
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 grid gap-6">
      <div className="grid md:grid-cols-2 gap-6">
        <img
          src={painting.image_url ?? undefined}
          alt={painting.title}
          className="rounded-xl w-full h-[400px] object-cover"
        />

        <Card>
          <CardContent className="relative space-y-4">
            <Button
              variant={isFavorite ? 'destructive' : 'outline'}
              onClick={handleFavoriteClick}
              className="absolute top-4 right-4"
              size="sm"
            >
              {isFavorite ? <HeartOff className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
            </Button>

            <CardTitle>
              <h1 className="text-2xl font-bold">{painting.title}</h1>
              <p className="text-xl text-muted-foreground">
                {painting.price !== null ? `${painting.price} $` : 'Цена не указана'}
              </p>
            </CardTitle>

            <p className="text-sm text-muted-foreground">{painting.description}</p>

            <div className="flex gap-2 items-center">
              {painting.created_by && (
                //<Link to={`/artist/${painting.created_by}`}>
                <Button variant="secondary">Профиль художника</Button>
                //</Link>
              )}
              <Button
                variant="outline"
                onClick={() => window.alert('Откройте нативный шэр-меню')}
              >
                <Share2 className="w-4 h-4 mr-1" />
                Поделиться
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
