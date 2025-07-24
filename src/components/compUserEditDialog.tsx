// src/components/compUserEditDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import {CompFileUploadWithPreview} from "./compFileUploadWithPreview"
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export function CompUserEditDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (val: boolean) => void
}) {
  const { user, updateUserProfile } = useUserStore()

  const [formData, setFormData] = useState({
    username: user?.username ?? '',
    avatar_url: user?.avatar_url ?? '',
    bio: user?.bio ?? '',
  })
  const [errors, setErrors] = useState<{ [k: string]: string }>({})
  const [loading, setLoading] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleCustomChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: '' }))
  }

  const validate = () => {
    const e: any = {}
    if (!formData.username.trim()) e.username = 'Имя не может быть пустым'
    if (
      formData.avatar_url &&
      !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(formData.avatar_url)
    ) {
      e.avatar_url = 'Неправильный формат URL картинки'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return
    if (!/^image\/(jpe?g|png|gif|webp)$/.test(file.type)) {
      toast.error('Неподдерживаемый формат файла')
      return
    }

    setLoading(true)
    try {
      const ext = file.name.split('.').pop()
      const { data, error } = await supabase.auth.getUser()
      if (error || !data.user) throw error

      const userId = data.user.id
      const fileName = `${userId}/${userId}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      if (!urlData.publicUrl) throw new Error('Публичный URL не получен')

      handleCustomChange('avatar_url', urlData.publicUrl)
    } catch (err) {
      console.error(err)
      toast.error('Ошибка загрузки файла')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      await updateUserProfile(formData)
      toast.success('Профиль обновлён')
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast.error('Не удалось обновить профиль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать профиль</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="username">Имя пользователя</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={errors.username ? 'border-red-500' : ''}
            />
            {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
          </div>

          <div>
            <Label htmlFor="avatar_url">URL аватара</Label>
            <Input
              id="avatar_url"
              name="avatar_url"
              value={formData.avatar_url}
              onChange={handleInputChange}
              className={errors.avatar_url ? 'border-red-500' : ''}
            />
            {errors.avatar_url && <p className="text-red-500 text-sm">{errors.avatar_url}</p>}
          </div>

          <div>
            <CompFileUploadWithPreview onFileSelect={handleFileUpload} />
          </div>

          <div>
            <Label htmlFor="bio">Биография</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Сохраняем...' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}