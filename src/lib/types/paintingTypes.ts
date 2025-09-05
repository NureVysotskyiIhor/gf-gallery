// src/lib/types/paintingTypes.ts
export interface ExtendedPainting {
  id: number
  title: string
  description: string | null
  image_url: string | null
  price: number | null
  is_public: boolean
  status: 'for_sale' | 'not_for_sale' | 'sold'
  is_active: boolean
  created_by: string | null 
  created_at: string        
  updated_at: string | null 
    // Добавляем поле, которое подтягивается через join
  users?: {
    username: string
  } | null
}
