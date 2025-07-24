// src/components/PaintingGridByRole.tsx
import {CompFavoritesGrid} from "./compFavoritesGrid"
import {CompOwnerGrid} from "./compOwnerGrid"
import type { ExtendedUser } from "@/lib/types/userTypes"

export function CompPaintingGridByRole({ user }: { user: ExtendedUser }) {
  if (user.role_id === 1) {
    return <CompFavoritesGrid userId={user.id} />
  } else {
    return <CompOwnerGrid userId={user.id} />
  }
}

