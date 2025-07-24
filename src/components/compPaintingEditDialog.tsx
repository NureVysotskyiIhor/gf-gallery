//src/components/compPaintingEditDialog.tsx
import { useState, useEffect } from 'react'
import {
  Dialog, DialogTrigger, DialogContent,
  DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { usePaintingListStore } from '@/store/paintingListStore'
import type { ExtendedPainting } from '@/lib/types/paintingTypes'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

const paintingStatus = [
  { id: 'for_sale', name: 'For sale' },
  { id: 'not_for_sale', name: 'Not for sale' },
  { id: 'sold', name: 'Sold' },
]

type Status = 'for_sale' | 'not_for_sale' | 'sold'

export function CompPaintingEditDialog({
  painting,
  children,
  onFinish,
}: {
  painting: ExtendedPainting
  children: React.ReactNode
  onFinish: () => void
}) {
  const updatePainting = usePaintingListStore(s => s.updatePainting)
  const deletePainting = usePaintingListStore(s => s.deletePainting)

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    image_url: '',
    status: 'for_sale' as Status,
    is_public: true,
    is_active: true,
  })
  const [errors, setErrors] = useState<{ [k: string]: string }>({})
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setForm({
      title: painting.title,
      description: painting.description ?? '',
      price: painting.price != null ? painting.price.toString() : '',
      image_url: painting.image_url ?? '',
      status: painting.status ?? 'for_sale',
      is_public: painting.is_public,
      is_active: painting.is_active,
    })
  }, [painting])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setErrors(e => ({ ...e, [name]: '' }))
  }

  const handleCustomChange = (key: string, value: string) => {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  const validate = () => {
    const e: any = {}
    if (!form.title.trim()) e.title = 'Заголовок обязателен'
    if (form.price && (isNaN(Number(form.price)) || Number(form.price) < 0))
      e.price = 'Цена должна быть неотрицательным числом'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      await updatePainting(painting.id, {
        title: form.title.trim(),
        description: form.description.trim(),
        price: form.price ? Number(form.price) : null,
        status: form.status,
        image_url: form.image_url.trim(),
      })
      toast.success('Картина обновлена')
      onFinish()
      setOpen(false)
    } catch {
      toast.error('Не удалось обновить картину')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Удалить эту картину?')) return
    setLoading(true)
    try {
      await deletePainting(painting.id)
      toast.success('Картина удалена')
      onFinish()
      setOpen(false)
    } catch {
      toast.error('Не удалось удалить картину')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать картину</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Заголовок</Label>
            <Input
              id="title"
              name="title"
              value={form.title}
              onChange={handleInputChange}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
          </div>

          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor="price">Цена ($)</Label>
            <Input
              id="price"
              name="price"
              value={form.price}
              onChange={handleInputChange}
              className={errors.price ? 'border-red-500' : ''}
            />
            {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
          </div>

          <div>
            <Label htmlFor="image_url">Ссылка на изображение</Label>
            <Input
              id="image_url"
              name="image_url"
              value={form.image_url}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
              className={errors.image_url ? 'border-red-500' : ''}
            />
          </div>

          <div>
            <Label htmlFor="status">Статус</Label>
            <Select
              value={form.status}
              onValueChange={(v) => handleCustomChange('status', v)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                {paintingStatus.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="is_public">Публичная</Label>
          <Switch
            id="is_public"
            checked={form.is_public}
            onCheckedChange={(checked: boolean) =>
              setForm(f => ({ ...f, is_public: checked }))
            }
            disabled={loading}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="is_active">Активна</Label>
          <Switch
            id="is_active"
            checked={form.is_active}
            onCheckedChange={(checked: boolean) =>
              setForm(f => ({ ...f, is_active: checked }))
            }
            disabled={loading}
          />
        </div>
        <DialogFooter className="flex justify-between mt-4">
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            Удалить
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Сохраняем…' : 'Сохранить'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
