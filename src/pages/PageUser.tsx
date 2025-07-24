import { CompUserInfoCard} from "@/components/compUserInfoCard";
import { CompPaintingGridByRole} from "@/components/compPaintingGridByRole";
import { useUserStore } from "@/store/userStore";
export default function PageUser() {
  const { user } = useUserStore();
  if (!user) return null;
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <CompUserInfoCard user={user}/>
      <CompPaintingGridByRole user={user}/>
    </div>
  );
}