// src/components/compFileUploadWithPreview.tsx

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { Upload, Image, CheckCircle } from "lucide-react";

export function CompFileUploadWithPreview({
  onFileSelect,
}: {
  onFileSelect: (file: File) => void;
}) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onFileSelect(file);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="avatar_file" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        {t('avatar')}
      </Label>

      {/* Скрытый input для выбора файла */}
      <Input
        ref={fileInputRef}
        id="avatar_file"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Кнопка загрузки с улучшенным дизайном */}
      <Button 
        type="button" 
        onClick={handleButtonClick} 
        variant="outline"
        className={`w-full h-12 relative overflow-hidden transition-all duration-300 ${
          fileName 
            ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30' 
            : 'border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
        }`}
      >
        <div className="flex items-center gap-2">
          {fileName ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-green-700 dark:text-green-300 font-medium">
                {t('selectedFile', { fileName })}
              </span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {t('selectFile')}
              </span>
            </>
          )}
        </div>
      </Button>

      {/* Предпросмотр с улучшенным дизайном */}
      {previewUrl && (
        <div className="mt-4 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300">
          <Label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Image className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {t('preview')}:
          </Label>
          <div className="relative group">
            <img
              src={previewUrl}
              alt={t('previewImage')}
              className="max-h-48 w-auto rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-lg mx-auto transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            
            {/* Success indicator */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 shadow-lg flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          </div>
          
          {/* File info */}
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {fileName}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}