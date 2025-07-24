// src/components/PaintingCard.tsx
import { Card, CardContent, CardTitle } from "@/components/ui/card"

import type { ExtendedPainting } from "@/lib/types/paintingTypes"
import type { ReactNode } from "react"

interface Props {
  painting: ExtendedPainting
  actionButton?: ReactNode
}

export function CompPaintingCardGridProfile({ painting, actionButton }: Props) {
  return (
    <Card className="overflow-hidden rounded-xl shadow">
      <img
        src={painting.image_url ?? "/placeholder.png"}
        alt={painting.title}
        className="w-full h-48 object-cover bg-gray-100"
      />
      <CardContent className="p-4 space-y-2">
        <CardTitle>{painting.title}</CardTitle>
        {painting.description && (
          <p className="text-sm line-clamp-2">{painting.description}</p>
        )}
        <div className="flex justify-between items-center mt-2">
          <span className="font-medium">{painting.price?.toFixed(2)} $</span>
          {actionButton}
        </div>
      </CardContent>
    </Card>
  )
}
