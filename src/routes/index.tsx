import { createFileRoute } from "@tanstack/react-router";
import { CompPaintingGrid  } from "@/components/compPaintingGrid";
export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <CompPaintingGrid/>
    </>
  );
}
