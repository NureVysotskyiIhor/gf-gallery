// src/components/compFileUploadWithPreview.tsx

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function CompFileUploadWithPreview({
  onFileSelect,
}: {
  onFileSelect: (file: File) => void;
}) {
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
    <div className="space-y-2">
      <Label htmlFor="avatar_file">Аватар</Label>

      {/* Скрытый input для выбора файла */}
      <Input
        ref={fileInputRef}
        id="avatar_file"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Кнопка загрузки */}
      <Button type="button" onClick={handleButtonClick} variant="outline">
        {fileName ? `Выбран: ${fileName}` : "Выбрать файл"}
      </Button>

      {/* Предпросмотр */}
      {previewUrl && (
        <div className="mt-2">
          <Label className="mb-1 block text-sm text-muted-foreground">
            Предпросмотр:
          </Label>
          <img
            src={previewUrl}
            alt="Предпросмотр"
            className="max-h-40 rounded-lg border border-muted"
          />
        </div>
      )}
    </div>
  );
}
