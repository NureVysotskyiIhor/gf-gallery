// src/components/compReviewForm.tsx
import { useState } from 'react';
import { useReviewsStore } from '@/store/reviewsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
// import { createClient } from '@supabase/supabase-js';
import { 
  Star, Plus, Upload, X, Loader2, AlertCircle, 
  User, Mail, MessageSquare, Sparkles, Tag, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from "react-i18next";
import { useUserStore } from "@/store/userStore";

// const supabase = createClient(
//   import.meta.env.VITE_SUPABASE_URL!,
//   import.meta.env.VITE_SUPABASE_ANON_KEY!
// );

interface ReviewFormData {
  author_name: string;
  author_email: string;
  rating: number;
  title: string;
  content: string;
  project_name: string;
  project_type: string;
  tags: string[];
}

interface ReviewFormProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

// Предопределенные теги с локализацией
const PREDEFINED_TAGS = [
  'professionalWork',
  'excellentCommunication', 
  'onTime',
  'highQuality',
  'affordablePrice',
  'creative',
  'detailedWork',
  'patientArtist',
  'uniqueStyle',
  'fastDelivery',
  'revisionsFriendly',
  'professionalAdvice',
  'beautifulResult',
  'recommendToOthers',
  'exceedsExpectations',
  'attentionToDetail',
  'kindArtist',
  'clearInstructions',
  'flexibleSchedule',
  'amazingSkills'
] as const;

export function CompReviewForm({ trigger, onSuccess }: ReviewFormProps) {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const { createReview } = useReviewsStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [hoverRating, setHoverRating] = useState(0);
  const [showAllTags, setShowAllTags] = useState(false);
  
  const [formData, setFormData] = useState<ReviewFormData>({
    author_name: user?.username || '',
    author_email: user?.email || '',
    rating: 0,
    title: '',
    content: '',
    project_name: '',
    project_type: '',
    tags: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Локализованные типы проектов
  const projectTypes = [
    { value: 'portrait', labelKey: 'projectTypePortrait' },
    { value: 'landscape', labelKey: 'projectTypeLandscape' },
    { value: 'abstract', labelKey: 'projectTypeAbstract' },
    { value: 'still_life', labelKey: 'projectTypeStillLife' },
    { value: 'illustration', labelKey: 'projectTypeIllustration' },
    { value: 'pet_portrait', labelKey: 'projectTypePetPortrait' },
    { value: 'digital_art', labelKey: 'projectTypeDigitalArt' },
    { value: 'other', labelKey: 'projectTypeOther' }
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.author_name.trim()) {
      newErrors.author_name = t('nameRequired');
    }

    if (!formData.author_email.trim()) {
      newErrors.author_email = t('emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.author_email)) {
      newErrors.author_email = t('invalidEmailError');
    }

    if (formData.rating === 0) {
      newErrors.rating = t('ratingRequired');
    }

    if (!formData.title.trim()) {
      newErrors.title = t('titleRequired');
    }

    if (!formData.content.trim()) {
      newErrors.content = t('reviewContentRequired');
    } else if (formData.content.trim().length < 20) {
      newErrors.content = t('reviewContentMinLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const selectedFiles = Array.from(files).slice(0, 5 - selectedImages.length);
    const newPreviews: string[] = [];

    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newPreviews.push(e.target.result as string);
          if (newPreviews.length === selectedFiles.length) {
            setPreviewImages(prev => [...prev, ...newPreviews]);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    setSelectedImages(prev => [...prev, ...selectedFiles]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleTag = (tagKey: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagKey)
        ? prev.tags.filter(tag => tag !== tagKey)
        : prev.tags.length < 10 
          ? [...prev.tags, tagKey]
          : prev.tags
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // const { data: { user } } = await supabase.auth.getUser();
      
      const reviewData = {
        ...formData,
        is_verified: !!user,
        user_id: user?.id || undefined
      };

      await createReview(reviewData);

      if (selectedImages.length > 0) {
        toast.info(t('reviewCreatedUploadingImages'));
      } else {
        toast.success(t('reviewCreatedSuccessfully'));
      }

      // Reset form
      setFormData({
        author_name: user?.username || '',
        author_email: user?.email || '',
        rating: 0,
        title: '',
        content: '',
        project_name: '',
        project_type: '',
        tags: []
      });
      setSelectedImages([]);
      setPreviewImages([]);
      setErrors({});
      setOpen(false);
      onSuccess?.();

    } catch (error) {
      console.error('Error creating review:', error);
      toast.error(t('reviewCreationError'));
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
      <Plus className="w-4 h-4 mr-2" />
      {t('addReview')}
    </Button>
  );

  // Отображаемые теги (первые 12 или все)
  const displayedTags = showAllTags ? PREDEFINED_TAGS : PREDEFINED_TAGS.slice(0, 12);
  const hasMoreTags = PREDEFINED_TAGS.length > 12;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen && !user) {
          toast.error(t('authRequired'), {
            description: t('loginToAddReview'),
          });
          return;
        }
        setOpen(nextOpen);
      }}
    >
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('addReview')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author_name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {t('username')} *
              </Label>
              <Input
                id="author_name"
                value={formData.author_name}
                disabled
                onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                placeholder={t('enterYourName')}
                className={errors.author_name ? 'border-red-500' : ''}
              />
              {errors.author_name && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.author_name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="author_email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email *
              </Label>
              <Input
                id="author_email"
                type="email"
                value={formData.author_email}
                disabled
                onChange={(e) => setFormData(prev => ({ ...prev, author_email: e.target.value }))}
                placeholder="your@email.com"
                className={errors.author_email ? 'border-red-500' : ''}
              />
              {errors.author_email && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.author_email}
                </p>
              )}
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              {t('rating')} *
            </Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || formData.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 hover:text-yellow-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.rating}
              </p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              {t('reviewTitle')} *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={t('reviewTitlePlaceholder')}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              {t('reviewContent')} *
            </Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder={t('reviewContentPlaceholder')}
              rows={5}
              className={errors.content ? 'border-red-500' : ''}
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{formData.content.length} {t('characters')}</span>
              {formData.content.length < 20 && (
                <span className="text-red-500">{t('minimumCharacters', { count: 20 })}</span>
              )}
            </div>
            {errors.content && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.content}
              </p>
            )}
          </div>

          {/* Project Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project_name" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {t('projectName')}
              </Label>
              <Input
                id="project_name"
                value={formData.project_name}
                onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
                placeholder={t('projectNamePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_type" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {t('projectType')}
              </Label>
              <Select
                value={formData.project_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, project_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectProjectType')} />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {t(type.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              {t('reviewTags')} ({formData.tags.length}/10)
            </Label>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {displayedTags.map(tagKey => (
                <button
                  key={tagKey}
                  type="button"
                  onClick={() => toggleTag(tagKey)}
                  disabled={!formData.tags.includes(tagKey) && formData.tags.length >= 10}
                  className={`p-2 rounded-lg text-sm font-medium transition-all duration-200 text-left flex items-center justify-between ${
                    formData.tags.includes(tagKey)
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } ${!formData.tags.includes(tagKey) && formData.tags.length >= 10 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} border`}
                >
                  <span className="truncate">{t(tagKey)}</span>
                  {formData.tags.includes(tagKey) && (
                    <Check className="w-4 h-4 flex-shrink-0 ml-1" />
                  )}
                </button>
              ))}
            </div>

            {hasMoreTags && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAllTags(!showAllTags)}
                className="mt-2"
              >
                {showAllTags ? t('showLess') : t('showMore')} ({PREDEFINED_TAGS.length - 12} {t('more')})
              </Button>
            )}

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {t('selectedTags')}:
                </span>
                {formData.tags.map(tagKey => (
                  <Badge
                    key={tagKey}
                    variant="secondary"
                    className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                  >
                    {t(tagKey)}
                    <button
                      type="button"
                      onClick={() => toggleTag(tagKey)}
                      className="hover:text-red-500 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              {t('reviewImages')} ({selectedImages.length}/5)
            </Label>
            <div className="space-y-4">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                disabled={selectedImages.length >= 5}
                className="cursor-pointer"
              />
              
              {previewImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`${t('preview')} ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading || uploadingImages}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('creatingReview')}...
                </>
              ) : uploadingImages ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('uploadingImages')}...
                </>
              ) : (
                t('publishReview')
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading || uploadingImages}
            >
              {t('cancel')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}