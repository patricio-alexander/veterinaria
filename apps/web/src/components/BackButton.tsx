import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="flex items-center mb-4 gap-1 cursor-pointer"
    >
      <ArrowLeft size={18} />
      Regresar
    </button>
  );
}
