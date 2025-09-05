// src/components/compPaintingEditDialog.tsx - версия с локализацией
import { useState, useEffect } from 'react'
import {
  Dialog, DialogTrigger, DialogContent,
  DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useTranslation } from "react-i18next"
import { toast } from 'sonner'
import { usePaintingListStore } from '@/store/paintingListStore'
import type { ExtendedPainting } from '@/lib/types/paintingTypes'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Palette,
  ImageIcon,
  DollarSign,
  FileText,
  Globe,
  Lock,
  Sparkles,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ShoppingCart,
  Tag,
  Zap,
  Edit3,
  Eye,
} from 'lucide-react'

const paintingStatus = [
  { id: 'for_sale', name: 'For sale', icon: ShoppingCart, color: 'text-green-500' },
  { id: 'not_for_sale', name: 'Not for sale', icon: Lock, color: 'text-blue-500' },
  { id: 'sold', name: 'Sold', icon: Tag, color: 'text-gray-500' },
]

type Status = 'for_sale' | 'not_for_sale' | 'sold'

// Компонент для анимированных частиц
function EditParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="absolute opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        >
          <Sparkles 
            className="w-1.5 h-1.5 text-indigo-400 animate-pulse" 
            style={{ 
              animationDuration: `${1.5 + Math.random() * 1.5}s`
            }}
          />
        </div>
      ))}
    </div>
  );
}

// Компонент загрузочного состояния
function EditLoadingOverlay() {
  const { t } = useTranslation();
  
  return (
    <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl flex items-center justify-center z-30">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 border-3 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
          <Edit3 className="w-4 h-4 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{t('savingChanges')}</p>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div 
              key={i}
              className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Компонент удаления с подтверждением
function DeleteLoadingOverlay() {
  const { t } = useTranslation();
  
  return (
    <div className="absolute inset-0 bg-red-50/90 dark:bg-red-900/20 backdrop-blur-sm rounded-xl flex items-center justify-center z-30">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 border-3 border-red-200 dark:border-red-800 border-t-red-600 dark:border-t-red-400 rounded-full animate-spin"></div>
          <Trash2 className="w-4 h-4 text-red-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-xs text-red-600 dark:text-red-400 font-medium">{t('deletingPainting')}</p>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div 
              key={i}
              className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Исправленный компонент превью изображения для EditDialog
function ImagePreview({ url, loading }: { url: string; loading: boolean }) {
  const { t } = useTranslation();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Сбрасываем состояние ошибки при изменении URL
  useEffect(() => {
    if (url) {
      setImageError(false);
      setImageLoading(true);
    }
  }, [url]);

  if (!url) {
    return (
      <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
        <div className="text-center">
          <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('noImage')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 group">
      {(imageLoading || loading) && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-gray-400 animate-pulse" />
        </div>
      )}
      {!imageError ? (
        <img
          src={url}
          alt={t('previewImage')}
          className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-red-50 dark:bg-red-900/20">
          <div className="text-center">
            <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
            <p className="text-xs text-red-600 dark:text-red-400">{t('imageLoadError')}</p>
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
        <Eye className="w-5 h-5 text-white" />
      </div>
    </div>
  );
}

export function CompPaintingEditDialog({
  painting,
  children,
  onFinish,
}: {
  painting: ExtendedPainting
  children: React.ReactNode
  onFinish: () => void
}) {
  const { t } = useTranslation();
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
  const [fieldValidation, setFieldValidation] = useState<{ [k: string]: boolean }>({})
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
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
    // Reset validation when painting changes
    setFieldValidation({})
    setErrors({})
  }, [painting, open])

  const getStatusLabel = (statusId: string) => {
    const statusLabels = {
      for_sale: t('statusForSale'),
      not_for_sale: t('statusNotForSale'),
      sold: t('statusSold')
    };
    return statusLabels[statusId as keyof typeof statusLabels] || statusId;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setErrors(e => ({ ...e, [name]: '' }))
    
    // Real-time validation
    if (name === 'title' && value) {
      setFieldValidation(prev => ({ ...prev, title: value.trim().length >= 3 }))
    }
    if (name === 'price' && value) {
      setFieldValidation(prev => ({ ...prev, price: !isNaN(Number(value)) && Number(value) >= 0 }))
    }
    if (name === 'image_url' && value) {
      setFieldValidation(prev => ({ ...prev, image_url: /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?.*)?(#.*)?$/i.test(value.trim()) }))
    }
  }

  const handleCustomChange = (key: string, value: string) => {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  const validate = () => {
    const e: any = {}
    if (!form.title.trim()) e.title = t('titleRequired')
    if (form.title.trim().length < 3) e.title = t('titleMinLength')
    if (form.price && (isNaN(Number(form.price)) || Number(form.price) < 0))
      e.price = t('pricePositiveNumber')
    if (form.image_url && !/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?.*)?(#.*)?$/i.test(form.image_url.trim()))
      e.image_url = t('correctImageLink')
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
        is_public: form.is_public,
        is_active: form.is_active,
      })
      toast.success(t('paintingUpdated'), { description: t('changesSavedSuccessfully') })
      onFinish()
      setOpen(false)
    } catch (error) {
      toast.error(t('updateError'), { description: t('failedToSaveChanges') })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(t('confirmDelete'))) return
    setDeleteLoading(true)
    try {
      await deletePainting(painting.id)
      toast.success(t('paintingDeleted'), { description: t('paintingDeletedFromGallery') })
      onFinish()
      setOpen(false)
    } catch (error) {
      toast.error(t('deleteError'), { description: t('failedToDeletePainting') })
    } finally {
      setDeleteLoading(false)
    }
  }

  const selectedStatus = paintingStatus.find(s => s.id === form.status)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 dark:from-gray-900 dark:via-indigo-900/10 dark:to-purple-900/10 border-0 shadow-2xl backdrop-blur-sm">
        {/* Background particles */}
        <EditParticles />
        
        {/* Loading overlays */}
        {loading && <EditLoadingOverlay />}
        {deleteLoading && <DeleteLoadingOverlay />}

        <DialogHeader className="relative z-10">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            <Edit3 className="w-5 h-5 text-indigo-600" />
            {t('editPainting')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 relative z-10 max-h-[60vh] overflow-y-auto pr-2">
          {/* Image Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              {t('preview')}
            </Label>
            <ImagePreview url={form.image_url} loading={loading || deleteLoading} />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              {t('paintingTitle')}
            </Label>
            <div className="relative">
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                disabled={loading || deleteLoading}
                className={`h-11 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200 ${
                  errors.title ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''
                } ${
                  fieldValidation.title ? 'border-green-400 focus:border-green-500' : ''
                }`}
              />
              {fieldValidation.title && !errors.title && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
              )}
            </div>
            {errors.title && (
              <p className="text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {t('description')}
            </Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleInputChange}
              disabled={loading || deleteLoading}
              rows={3}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200 resize-none"
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              {t('priceUSD')}
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="price"
                name="price"
                value={form.price}
                onChange={handleInputChange}
                disabled={loading || deleteLoading}
                className={`pl-10 h-11 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200 ${
                  errors.price ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''
                } ${
                  fieldValidation.price && form.price ? 'border-green-400 focus:border-green-500' : ''
                }`}
              />
              {fieldValidation.price && form.price && !errors.price && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
              )}
            </div>
            {errors.price && (
              <p className="text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.price}
              </p>
            )}
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="image_url" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              {t('imageLink')}
            </Label>
            <div className="relative">
              <Input
                id="image_url"
                name="image_url"
                value={form.image_url}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                disabled={loading || deleteLoading}
                className={`h-11 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200 ${
                  errors.image_url ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''
                } ${
                  fieldValidation.image_url ? 'border-green-400 focus:border-green-500' : ''
                }`}
              />
              {fieldValidation.image_url && !errors.image_url && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
              )}
            </div>
            {errors.image_url && (
              <p className="text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.image_url}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              {t('status')}
            </Label>
            <Select
              value={form.status}
              onValueChange={(v) => handleCustomChange('status', v)}
              disabled={loading || deleteLoading}
            >
              <SelectTrigger className="h-11 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500">
                <SelectValue>
                  {selectedStatus && (
                    <div className="flex items-center gap-2">
                      <selectedStatus.icon className={`w-4 h-4 ${selectedStatus.color}`} />
                      <span>{getStatusLabel(selectedStatus.id)}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {paintingStatus.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    <div className="flex items-center gap-2">
                      <status.icon className={`w-4 h-4 ${status.color}`} />
                      <span>{getStatusLabel(status.id)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Switches */}
          <div className="space-y-3 p-3 bg-white/40 dark:bg-gray-800/40 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {form.is_public ? (
                  <Globe className="w-4 h-4 text-blue-500" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-500" />
                )}
                <div>
                  <Label htmlFor="is_public" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('visible')}
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('visibleToAllUsers')}
                  </p>
                </div>
              </div>
              <Switch
                id="is_public"
                checked={form.is_public}
                onCheckedChange={(checked: boolean) =>
                  setForm(f => ({ ...f, is_public: checked }))
                }
                disabled={loading || deleteLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                <div>
                  <Label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('displayed')}
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('displayedInGallery')}
                  </p>
                </div>
              </div>
              <Switch
                id="is_active"
                checked={form.is_active}
                onCheckedChange={(checked: boolean) =>
                  setForm(f => ({ ...f, is_active: checked }))
                }
                disabled={loading || deleteLoading}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between mt-6 relative z-10">
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={loading || deleteLoading}
            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
          >
            {deleteLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {t('deleting')}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                {t('delete')}
              </div>
            )}
          </Button>
          
          <div className="space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)} 
              disabled={loading || deleteLoading}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm"
            >
              {t('cancel')}
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={loading || deleteLoading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {t('saving')}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {t('save')}
                </div>
              )}
            </Button>
          </div>
        </DialogFooter>

        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-indigo-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-xl pointer-events-none" />
      </DialogContent>
    </Dialog>
  )
}