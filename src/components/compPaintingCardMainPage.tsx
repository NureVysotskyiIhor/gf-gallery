import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { ExtendedPainting } from "@/lib/types/paintingTypes";
import { format } from "date-fns";

interface PaintingCardProps {
  painting: ExtendedPainting;
}

export function CompPaintingCardMainPage({ painting }: PaintingCardProps) {
  const formattedPrice =
    painting.price != null
      ? `${painting.price.toFixed(2)} $`
      : "Цена не указана";

  const createdAt = painting.created_at
    ? format(new Date(painting.created_at), "dd MMM yyyy")
    : "";

  return (
    <Card className="overflow-hidden rounded-xl shadow">
      <Link to="/route-painting" search={{ paintingId: painting.id }} className="block">
        <img
          src={painting.image_url ?? "/placeholder.png"}
          alt={painting.title}
          className="w-full h-48 object-cover bg-gray-100"
        />
      </Link>
      <CardContent className="p-4 space-y-2">
        <Link to="/route-painting" search={{ paintingId: painting.id }} className="[&.active]:underline">
          <CardTitle>
            <h3 className="text-lg font-semibold line-clamp-1">
              {painting.title}
            </h3>
          </CardTitle>
        </Link>
        {painting.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {painting.description}
          </p>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{formattedPrice}</span>
          {createdAt && (
            <span className="text-muted-foreground">{createdAt}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
