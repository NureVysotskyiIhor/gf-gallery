import { CompPaintingForm } from "@/components/compPaintingForm";

export default function PagePainting({paintingId} : { paintingId: number}) {
  return (
    <div className="flex gap-8 p-8 justify-center items-start">
      <CompPaintingForm paintingId={paintingId}/>
    </div>
  );
}