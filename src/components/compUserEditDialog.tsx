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
import { useState, useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { CompFileUploadWithPreview } from "./compFileUploadWithPreview";
import { 
  User,
  FileText, 
  Save, 
  X, 
  Upload,
  Camera,
  Sparkles,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export function CompUserEditDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (val: boolean) => void;
}) {
  const { user, updateUserProfile } = useUserStore();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    username: user?.username ?? '',
    avatar_url: user?.avatar_url ?? '',
    bio: user?.bio ?? '',
  });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isFormChanged, setIsFormChanged] = useState(false);

  // Reset form when dialog opens/closes or user changes
  useEffect(() => {
    if (open && user) {
      setFormData({
        username: user.username ?? '',
        avatar_url: user.avatar_url ?? '',
        bio: user.bio ?? '',
      });
      setErrors({});
      setIsFormChanged(false);
      setUploadProgress(0);
    }
  }, [open, user]);

  // Check if form has changed
  useEffect(() => {
    if (user) {
      const hasChanged = 
        formData.username !== (user.username ?? '') ||
        formData.avatar_url !== (user.avatar_url ?? '') ||
        formData.bio !== (user.bio ?? '');
      setIsFormChanged(hasChanged);
    }
  }, [formData, user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCustomChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e: any = {};
    if (!formData.username.trim()) {
      e.username = t('nameRequired');
    } else if (formData.username.length < 2) {
      e.username = t('nameMinLength');
    } else if (formData.username.length > 50) {
      e.username = t('nameMaxLength');
    }

    if (
      formData.avatar_url &&
      !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(formData.avatar_url)
    ) {
      e.avatar_url = t('invalidImageURL');
    }

    if (formData.bio && formData.bio.length > 500) {
      e.bio = t('bioMaxLength');
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (!/^image\/(jpe?g|png|gif|webp)$/.test(file.type)) {
      toast.error(t('unsupportedFormat'));
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
      const fileName = `${userId}/${userId}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (!urlData.publicUrl) throw new Error('Публичный URL не получен');

      setUploadProgress(100);
      handleCustomChange('avatar_url', urlData.publicUrl);
      toast.success(t('avatarUploaded'));
    } catch (err) {
      console.error(err);
      toast.error(t('uploadError'));
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
      await updateUserProfile(formData);
      toast.success(t('profileUpdated'));
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error(t('profileUpdateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isFormChanged) {
      const confirm = window.confirm(t('confirmClose'));
      if (!confirm) return;
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-900 dark:to-gray-800/80 border-0 shadow-2xl backdrop-blur-sm">
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
                <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {uploadProgress > 0 ? t('uploading', { progress: uploadProgress }) : t('saving')}
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
            {t('editProfile')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Preview */}
          {formData.avatar_url && (
            <div className="flex justify-center">
              <div className="relative group">
                <div className="w-35 h-35 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                  <img
                    src={formData.avatar_url}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"></div>
              </div>
            </div>
          )}

          {/* Username Field */}
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              {t('username')}
            </Label>
            <div className="relative">
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`pl-4 pr-10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 ${
                  errors.username ? 'border-red-500 focus:border-red-500' : ''
                }`}
                placeholder={t('enterYourName')}
              />
              {formData.username && !errors.username && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
              {errors.username && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
              )}
            </div>
            {errors.username && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.username}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('charactersLimit', { current: formData.username.length, max: 50 })}
            </p>
          </div>

          {/* Avatar URL Field */}
          <div className="space-y-2">
            <Label htmlFor="avatar_url" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Camera className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              {t('avatarURL')}
            </Label>
            <div className="relative">
              <Input
                id="avatar_url"
                name="avatar_url"
                value={formData.avatar_url}
                onChange={handleInputChange}
                className={`pl-4 pr-10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-200 ${
                  errors.avatar_url ? 'border-red-500 focus:border-red-500' : ''
                }`}
                placeholder="https://example.com/avatar.jpg"
              />
              {formData.avatar_url && !errors.avatar_url && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
              {errors.avatar_url && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
              )}
            </div>
            {errors.avatar_url && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.avatar_url}
              </p>
            )}
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Upload className="w-4 h-4 text-green-600 dark:text-green-400" />
              {t('orUploadFile')}
            </Label>
            <CompFileUploadWithPreview onFileSelect={handleFileUpload} />
          </div>

          {/* Bio Field */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              {t('biography')}
            </Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              className="min-h-[80px] bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 focus:border-orange-500 dark:focus:border-orange-400 transition-all duration-200 resize-none"
              placeholder={t('tellAboutYourself')}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 flex justify-between">
              <span>{t('optionalField')}</span>
              <span>{t('charactersLimit', { current: formData.bio.length, max: 500 })}</span>
            </p>
          </div>
        </div>

        {/* Status indicator */}
        {isFormChanged && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm text-amber-700 dark:text-amber-300">{t('unsavedChanges')}</span>
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
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !isFormChanged}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? t('saving') : t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}