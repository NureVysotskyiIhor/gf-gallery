//src\components\compPaintingCreate.tsx
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

const paintingStatus = [
  { id: 'for_sale', name: 'For sale' },
  { id: 'not_for_sale', name: 'Not for sale' },
  { id: 'sold', name: 'Sold' },
];

type Status = 'for_sale' | 'not_for_sale' | 'sold';

export function CompPaintingCreate() {
  const navigate = useNavigate();
  const { user } = useUserStore();
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

  const validate = () => {
    const e: { [key: string]: string } = {};
    if (!form.title.trim()) e.title = "Заголовок обязателен";
    if (form.price && (isNaN(Number(form.price)) || Number(form.price) < 0))
      e.price = "Цена должна быть неотрицательным числом";
    if (form.image_url && !/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(form.image_url.trim()))
      e.image_url = "Введите корректную ссылку на изображение";
    if (!form.status) e.status = "Выберите статус";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onChange = (key: keyof typeof form, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Не авторизован");
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
      toast.success("Картина добавлена");
      navigate({ to: "/user-page" });
    } catch {
      toast.error("Ошибка при добавлении");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 mt-6 p-4">
      <h1 className="text-2xl font-semibold">Новая картина</h1>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Заголовок</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => onChange('title', e.target.value)}
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
        </div>

        <div>
          <Label htmlFor="description">Описание</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => onChange('description', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="price">Цена ($)</Label>
          <Input
            id="price"
            value={form.price}
            onChange={(e) => onChange('price', e.target.value)}
            className={errors.price ? "border-red-500" : ""}
          />
          {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
        </div>

        <div>
          <Label htmlFor="image_url">Ссылка на изображение</Label>
          <Input
            id="image_url"
            value={form.image_url}
            onChange={(e) => onChange('image_url', e.target.value)}
            placeholder="https://example.com/image.jpg"
            className={errors.image_url ? "border-red-500" : ""}
          />
          {errors.image_url && (
            <p className="text-red-500 text-sm">{errors.image_url}</p>
          )}
        </div>

        <Select
          value={form.status}
          onValueChange={(v) => onChange('status', v)}
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
        {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
        <div className="flex items-center justify-between">
          <Label htmlFor="is_active">Активна ли картина?</Label>
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
          <Label htmlFor="is_active">Публична ли картина?</Label>
          <Switch
            id="is_active"
            checked={form.is_active}
            onCheckedChange={(checked) =>
              setForm((f) => ({ ...f, is_active: checked }))
            }
            disabled={loading}
          />
        </div>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Сохраняем…" : "Сохранить"}
        </Button>
      </div>
    </div>
  );
}
