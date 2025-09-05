//src\components\compHomepageEditDialog.tsx
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
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { CompFileUploadWithPreview } from "./compFileUploadWithPreview";
import { 
  User,
  FileText, 
  Save, 
  X, 
  Camera,
  Sparkles,
  AlertCircle,
  Plus,
  Trash2,
  Star,
  Award,
  GraduationCap,
  MapPin,
  Clock,
  Phone,
  Send,
  Instagram,
  Globe,
  Mail,
  Image as ImageIcon
} from "lucide-react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

interface HomepageProfile {
  id?: number;
  email: string;
  full_name: string;
  title?: string;
  subtitle?: string;
  bio?: string;
  avatar_url?: string;
  background_image_url?: string;
  skills?: string[];
  contact_phone?: string;
  contact_telegram?: string;
  contact_instagram?: string;
  contact_website?: string;
  years_experience?: number;
  location?: string;
  education?: string;
  achievements?: string[];
  is_active: boolean;
}

export function CompHomepageEditDialog({
  open,
  onOpenChange,
  profile,
  onSave,
}: {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  profile?: HomepageProfile | null;
  onSave?: () => void;
}) {
  const [formData, setFormData] = useState<HomepageProfile>({
    email: '',
    full_name: '',
    title: '',
    subtitle: '',
    bio: '',
    avatar_url: '',
    background_image_url: '',
    skills: [],
    contact_phone: '',
    contact_telegram: '',
    contact_instagram: '',
    contact_website: '',
    years_experience: undefined,
    location: '',
    education: '',
    achievements: [],
    is_active: true,
  });

  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  // Reset form when dialog opens/closes or profile changes
  useEffect(() => {
    if (open) {
      if (profile) {
        setFormData({
          ...profile,
          skills: profile.skills || [],
          achievements: profile.achievements || [],
        });
      } else {
        // New profile - get user email
        getCurrentUserEmail();
      }
      setErrors({});
      setIsFormChanged(false);
      setUploadProgress(0);
    }
  }, [open, profile]);

  const getCurrentUserEmail = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setFormData(prev => ({ ...prev, email: user.email! }));
      }
    } catch (error) {
      console.error('Error getting user email:', error);
    }
  };

  // Check if form has changed
  useEffect(() => {
    if (profile) {
      const hasChanged = JSON.stringify(formData) !== JSON.stringify({
        ...profile,
        skills: profile.skills || [],
        achievements: profile.achievements || [],
      });
      setIsFormChanged(hasChanged);
    } else {
      const hasChanged = formData.full_name.trim() !== '' || 
                        (formData.title || '').trim() !== '' ||
                        (formData.bio || '').trim() !== '';
      setIsFormChanged(hasChanged);
    }
  }, [formData, profile]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'years_experience') {
      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCustomChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills?.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.filter((_, i) => i !== index) || []
    }));
  };

  const addAchievement = () => {
    if (newAchievement.trim() && !formData.achievements?.includes(newAchievement.trim())) {
      setFormData(prev => ({
        ...prev,
        achievements: [...(prev.achievements || []), newAchievement.trim()]
      }));
      setNewAchievement('');
    }
  };

  const removeAchievement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements?.filter((_, i) => i !== index) || []
    }));
  };

  const validate = () => {
    const e: any = {};
    
    if (!formData.full_name.trim()) {
      e.full_name = 'Имя обязательно для заполнения';
    } else if (formData.full_name.length < 2) {
      e.full_name = 'Имя должно содержать минимум 2 символа';
    }

    if (!formData.email.trim()) {
      e.email = 'Email обязателен для заполнения';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = 'Некорректный формат email';
    }

    if (formData.avatar_url && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(formData.avatar_url)) {
      e.avatar_url = 'Некорректный URL изображения';
    }

    if (formData.background_image_url && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(formData.background_image_url)) {
      e.background_image_url = 'Некорректный URL изображения';
    }

    if (formData.years_experience && (formData.years_experience < 0 || formData.years_experience > 100)) {
      e.years_experience = 'Опыт должен быть от 0 до 100 лет';
    }

    if (formData.contact_website && !/^https?:\/\/.+/.test(formData.contact_website)) {
      e.contact_website = 'URL должен начинаться с http:// или https://';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileUpload = async (file: File, type: 'avatar' | 'background') => {
    if (!file) return;
    if (!/^image\/(jpe?g|png|gif|webp)$/.test(file.type)) {
      toast.error('Неподдерживаемый формат файла');
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      const ext = file.name.split('.').pop();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) throw error;

      const userId = data.user.id;
      const fileName = `${userId}/${type}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('homepage-profile')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('homepage-profile')
        .getPublicUrl(fileName);

      if (!urlData.publicUrl) throw new Error('Публичный URL не получен');

      setUploadProgress(100);
      const fieldName = type === 'avatar' ? 'avatar_url' : 'background_image_url';
      handleCustomChange(fieldName, urlData.publicUrl);
      toast.success(`${type === 'avatar' ? 'Аватар' : 'Фон'} загружен успешно`);
    } catch (err) {
      console.error(err);
      toast.error('Ошибка загрузки файла');
      setUploadProgress(0);
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    
    try {
      const dataToSave = {
        ...formData,
        skills: formData.skills?.length ? formData.skills : null,
        achievements: formData.achievements?.length ? formData.achievements : null,
        years_experience: formData.years_experience || null,
      };

      if (profile?.id) {
        // Update existing profile
        const { error } = await supabase
          .from('homepage_profile')
          .update(dataToSave)
          .eq('id', profile.id);
        
        if (error) throw error;
        toast.success('Профиль обновлен успешно');
      } else {
        // Create new profile
        const { error } = await supabase
          .from('homepage_profile')
          .insert([dataToSave]);
        
        if (error) throw error;
        toast.success('Профиль создан успешно');
      }

      onSave?.();
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Ошибка сохранения профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isFormChanged) {
      const confirm = window.confirm('У вас есть несохраненные изменения. Закрыть без сохранения?');
      if (!confirm) return;
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-900 dark:to-gray-800/80 border-0 shadow-2xl backdrop-blur-sm">
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
                <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {uploadProgress > 0 ? `Загрузка ${uploadProgress}%` : 'Сохранение...'}
              </p>
              {uploadProgress > 0 && (
                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white shadow-lg">
              <User className="w-5 h-5" />
            </div>
            {profile ? 'Редактировать профиль' : 'Создать профиль'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Полное имя *
              </Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 ${
                  errors.full_name ? 'border-red-500' : ''
                }`}
                placeholder="Анна Иванова"
              />
              {errors.full_name && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.full_name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Mail className="w-4 h-4 text-red-600 dark:text-red-400" />
                Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 ${
                  errors.email ? 'border-red-500' : ''
                }`}
                placeholder="artist@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Профессия/Титул
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title || ''}
                onChange={handleInputChange}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50"
                placeholder="Художница"
              />
            </div>

            {/* Years Experience */}
            <div className="space-y-2">
              <Label htmlFor="years_experience" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                Лет опыта
              </Label>
              <Input
                id="years_experience"
                name="years_experience"
                type="number"
                value={formData.years_experience || ''}
                onChange={handleInputChange}
                className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 ${
                  errors.years_experience ? 'border-red-500' : ''
                }`}
                placeholder="5"
                min="0"
                max="100"
              />
              {errors.years_experience && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.years_experience}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="location" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <MapPin className="w-4 h-4 text-red-600 dark:text-red-400" />
                Местоположение
              </Label>
              <Input
                id="location"
                name="location"
                value={formData.location || ''}
                onChange={handleInputChange}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50"
                placeholder="Москва, Россия"
              />
            </div>
          </div>

          {/* Subtitle and Bio */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subtitle" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                Краткое описание
              </Label>
              <Input
                id="subtitle"
                name="subtitle"
                value={formData.subtitle || ''}
                onChange={handleInputChange}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50"
                placeholder="Создаю уникальные произведения искусства"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                Подробная биография
              </Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio || ''}
                onChange={handleInputChange}
                className="min-h-[120px] bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50"
                placeholder="Расскажите о себе подробнее..."
              />
            </div>
          </div>

          {/* Images */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Avatar */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Фото профиля
              </Label>
              {formData.avatar_url && (
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg mx-auto">
                  <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              )}
              <Input
                name="avatar_url"
                value={formData.avatar_url || ''}
                onChange={handleInputChange}
                className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 ${
                  errors.avatar_url ? 'border-red-500' : ''
                }`}
                placeholder="https://example.com/avatar.jpg"
              />
              <CompFileUploadWithPreview onFileSelect={(file) => handleFileUpload(file, 'avatar')} />
              {errors.avatar_url && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.avatar_url}
                </p>
              )}
            </div>

            {/* Background */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Фоновое изображение
              </Label>
              {formData.background_image_url && (
                <div className="w-full h-24 rounded-lg overflow-hidden border-2 border-white dark:border-gray-800 shadow-lg">
                  <img src={formData.background_image_url} alt="Background" className="w-full h-full object-cover" />
                </div>
              )}
              <Input
                name="background_image_url"
                value={formData.background_image_url || ''}
                onChange={handleInputChange}
                className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 ${
                  errors.background_image_url ? 'border-red-500' : ''
                }`}
                placeholder="https://example.com/background.jpg"
              />
              <CompFileUploadWithPreview onFileSelect={(file) => handleFileUpload(file, 'background')} />
              {errors.background_image_url && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.background_image_url}
                </p>
              )}
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              Навыки и умения
            </Label>
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.skills?.map((skill, index) => (
                <Badge 
                  key={index}
                  variant="secondary"
                  className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 flex items-center gap-2"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="ml-1 hover:bg-red-200 dark:hover:bg-red-800 rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                className="flex-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50"
                placeholder="Добавить навык"
              />
              <Button
                type="button"
                onClick={addSkill}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Education */}
          <div className="space-y-2">
            <Label htmlFor="education" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <GraduationCap className="w-4 h-4 text-green-600 dark:text-green-400" />
              Образование
            </Label>
            <Textarea
              id="education"
              name="education"
              value={formData.education || ''}
              onChange={handleInputChange}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50"
              placeholder="Московский художественный институт им. В.И. Сурикова"
            />
          </div>

          {/* Achievements */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Достижения и награды
            </Label>
            <div className="space-y-2 mb-4">
              {formData.achievements?.map((achievement, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-white/40 dark:bg-gray-800/40 rounded-lg">
                  <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{achievement}</span>
                  <button
                    type="button"
                    onClick={() => removeAchievement(index)}
                    className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Textarea
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                className="flex-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 min-h-[60px]"
                placeholder="Описание достижения"
              />
              <Button
                type="button"
                onClick={addAchievement}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 self-end"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="contact_phone" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                Телефон
              </Label>
              <Input
                id="contact_phone"
                name="contact_phone"
                value={formData.contact_phone || ''}
                onChange={handleInputChange}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50"
                placeholder="+7 900 123-45-67"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_telegram" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Telegram
              </Label>
              <Input
                id="contact_telegram"
                name="contact_telegram"
                value={formData.contact_telegram || ''}
                onChange={handleInputChange}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50"
                placeholder="@username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_instagram" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Instagram className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                Instagram
              </Label>
              <Input
                id="contact_instagram"
                name="contact_instagram"
                value={formData.contact_instagram || ''}
                onChange={handleInputChange}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50"
                placeholder="@username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_website" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Веб-сайт
              </Label>
              <Input
                id="contact_website"
                name="contact_website"
                value={formData.contact_website || ''}
                onChange={handleInputChange}
                className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 ${
                  errors.contact_website ? 'border-red-500' : ''
                }`}
                placeholder="https://mywebsite.com"
              />
              {errors.contact_website && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.contact_website}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status indicator */}
        {isFormChanged && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm text-amber-700 dark:text-amber-300">
              У вас есть несохраненные изменения
            </span>
          </div>
        )}

        <DialogFooter className="flex justify-end gap-3 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={loading}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <X className="w-4 h-4 mr-2" />
            Отмена
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !isFormChanged}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}