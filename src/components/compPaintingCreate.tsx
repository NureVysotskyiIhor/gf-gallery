// src/components/compPaintingCreate.tsx - версия с локализацией
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { usePaintingListStore } from "@/store/paintingListStore";
import { useUserStore } from "@/store/userStore";
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { 
  Palette, 
  ImageIcon, 
  DollarSign, 
  FileText,
  Globe, 
  Lock, 
  Sparkles, 
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle2,
  Upload,
  ShoppingCart,
  Tag,
  Zap
} from 'lucide-react';

const paintingStatus = [
  { id: 'for_sale', name: 'For sale', icon: ShoppingCart, color: 'text-green-500' },
  { id: 'not_for_sale', name: 'Not for sale', icon: Lock, color: 'text-blue-500' },
  { id: 'sold', name: 'Sold', icon: Tag, color: 'text-gray-500' },
];

type Status = 'for_sale' | 'not_for_sale' | 'sold';

// Компонент для анимированных частиц
function CreateParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="absolute opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        >
          <Sparkles 
            className="w-2 h-2 text-emerald-400 animate-pulse" 
            style={{ 
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        </div>
      ))}
    </div>
  );
}

// Компонент загрузочного состояния
function CreateLoadingOverlay() {
  const { t } = useTranslation();
  
  return (
    <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl flex items-center justify-center z-20">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin"></div>
          <Upload className="w-6 h-6 text-emerald-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('creatingMasterpiece')}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{t('preparingGallery')}</p>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div 
              key={i}
              className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Улучшенный компонент превью изображения для CreateDialog
function ImagePreview({ url, loading }: { url: string; loading: boolean }) {
  const { t } = useTranslation();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // Сбрасываем состояние ошибки и loading при изменении URL
  useEffect(() => {
    if (url) {
      setImageError(false);
      setImageLoading(true);
      setImageDimensions({ width: 0, height: 0 });
    }
  }, [url]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    setImageLoading(false);
  };

  if (!url) {
    return (
      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
        <div className="text-center">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('previewImage')}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{t('enterImageLink')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-h-64 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      {(imageLoading || loading) && (
        <div className="absolute inset-0 h-48 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-gray-400 animate-pulse" />
        </div>
      )}
      {!imageError ? (
        <img
          src={url}
          alt={t('previewImage')}
          className={`w-full max-h-64 object-contain transition-opacity duration-300 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleImageLoad}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />
      ) : (
        <div className="w-full h-48 flex items-center justify-center bg-red-50 dark:bg-red-900/20">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600 dark:text-red-400">{t('imageLoadError')}</p>
          </div>
        </div>
      )}
      
      {/* Информация о размерах изображения */}
      {!imageLoading && !imageError && imageDimensions.width > 0 && (
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
          {imageDimensions.width} × {imageDimensions.height}
        </div>
      )}
    </div>
  );
}

export function CompPaintingCreate() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { t } = useTranslation();
  const addPainting = usePaintingListStore.getState().addPainting;

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<{
    title: string;
    description: string;
    price: string;
    image_url: string;
    status: Status;
    is_active: boolean;
    is_public: boolean;
  }>({
    title: "",
    description: "",
    price: "",
    image_url: "",
    status: 'for_sale',
    is_active: true,
    is_public: true,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [fieldValidation, setFieldValidation] = useState<{ [key: string]: boolean }>({});

  const validate = () => {
    const e: { [key: string]: string } = {};
    if (!form.title.trim()) e.title = t('titleRequired');
    if (form.title.trim().length < 3) e.title = t('titleMinLength3');
    if (form.price && (isNaN(Number(form.price)) || Number(form.price) < 0))
      e.price = t('pricePositiveNumber');
    if (form.image_url && !/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?.*)?(#.*)?$/i.test(form.image_url.trim()))
      e.image_url = t('correctImageLink');
    if (!form.status) e.status = t('selectStatus');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onChange = (key: keyof typeof form, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
    
    // Real-time validation feedback
    if (key === 'title' && value) {
      setFieldValidation(prev => ({ ...prev, title: value.trim().length >= 3 }));
    }
    if (key === 'price' && value) {
      setFieldValidation(prev => ({ ...prev, price: !isNaN(Number(value)) && Number(value) >= 0 }));
    }
    if (key === 'image_url' && value) {
      setFieldValidation(prev => ({ ...prev, image_url: /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?.*)?(#.*)?$/i.test(value.trim()) }));
    }
  };

  const getStatusLabel = (statusId: string) => {
    const statusLabels = {
      for_sale: t('statusForSale'),
      not_for_sale: t('statusNotForSale'),
      sold: t('statusSold')
    };
    return statusLabels[statusId as keyof typeof statusLabels] || statusId;
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error(t('authRequired'), { description: t('loginToAddFavorites') });
      return;
    }
    if (!validate()) return;

    setLoading(true);
    try {
      await addPainting({
        title: form.title.trim(),
        description: form.description.trim(),
        price: form.price ? Number(form.price) : null,
        image_url: form.image_url.trim() || null,
        created_by: user.id,
        status: form.status,
        is_active: form.is_active,
        is_public: form.is_public,
      });
      toast.success(t('paintingCreated'), { description: t('paintingAddedToGallery') });
      navigate({ to: "/user-page" });
    } catch (error) {
      toast.error(t('creationError'), { description: t('failedToAddPainting') });
    } finally {
      setLoading(false);
    }
  };

  const selectedStatus = paintingStatus.find(s => s.id === form.status);

  return (
    <div className="max-w-2xl mx-auto space-y-6 mt-6 p-6 relative">
      {/* Background particles */}
      <CreateParticles />
      
      {/* Loading overlay */}
      {loading && <CreateLoadingOverlay />}

      {/* Header */}
      <div className="relative z-10">
        <Button 
          variant="ghost" 
          onClick={() => navigate({ to: "/user-page" })}
          className="mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('backToProfile')}
        </Button>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Palette className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            {t('newPainting')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
            {t('shareCreativityWithWorld')}
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 dark:from-gray-900 dark:via-emerald-900/10 dark:to-teal-900/10 border-0 shadow-2xl p-8 rounded-2xl backdrop-blur-sm relative z-10">
        <div className="space-y-6">
          {/* Image Preview */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              {t('previewImage')}
            </Label>
            <ImagePreview url={form.image_url} loading={loading} />
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
                value={form.title}
                onChange={(e) => onChange('title', e.target.value)}
                placeholder={t('enterPaintingName')}
                disabled={loading}
                className={`h-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-200 ${
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
              value={form.description}
              onChange={(e) => onChange('description', e.target.value)}
              placeholder={t('describeYourPainting')}
              disabled={loading}
              rows={4}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-200 resize-none"
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
                value={form.price}
                onChange={(e) => onChange('price', e.target.value)}
                placeholder="0.00"
                disabled={loading}
                className={`pl-10 h-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-200 ${
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
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('leaveEmptyIfNoPrice')}
            </p>
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
                value={form.image_url}
                onChange={(e) => onChange('image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled={loading}
                className={`h-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500 transition-all duration-200 ${
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
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('imageFormatsSupported')}
            </p>
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              {t('saleStatus')}
            </Label>
            <Select
              value={form.status}
              onValueChange={(v) => onChange('status', v)}
              disabled={loading}
            >
              <SelectTrigger className="h-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500">
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
            {errors.status && (
              <p className="text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.status}
              </p>
            )}
          </div>

          {/* Switches */}
          <div className="space-y-4 p-4 bg-white/40 dark:bg-gray-800/40 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                <div>
                  <Label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('activePainting')}
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('paintingDisplayedInGallery')}
                  </p>
                </div>
              </div>
              <Switch
                id="is_active"
                checked={form.is_active}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, is_active: checked }))
                }
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {form.is_public ? (
                  <Globe className="w-4 h-4 text-blue-500" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-500" />
                )}
                <div>
                  <Label htmlFor="is_public" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('publicPainting')}
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('paintingVisibleToAll')}
                  </p>
                </div>
              </div>
              <Switch
                id="is_public"
                checked={form.is_public}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, is_public: checked }))
                }
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {t('creatingMasterpiece')}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {t('createPaintingButton')}
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}