"use client";

import { PageContainer } from "@/src/components/PageContainer";
import PetsList from "@/src/features/pets/components/PetsList";
import { FileText, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PetsPage() {
  const router = useRouter();

  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <h1 className="text-2xl font-bold">Mascotas</h1>
          {/* <Link href="/admin/pets/new"> */}
          {/*   <Button> */}
          {/*     <Plus /> */}
          {/*     Nueva mascota */}
          {/*   </Button> */}
          {/* </Link> */}
        </div>
      </div>
      <PetsList
        actionButtons={[
          {
            label: "Editar",
            key: "edit",
            description: "Editar mascota",
            icon: <Pencil size={18} />,
            onClick: (id: string) => {
              router.push(`/veterinary/pets/edit/${id}`);
            },
          },
          {
            label: "Expediente clinico",
            key: "clinical_history",
            description: "Ver expediente paciente/mascota",
            icon: <FileText size={18} />,
            onClick: (id: string) => {
              router.push(`/veterinary/pets/clinical_history/${id}`);
            },
          },
        ]}
      />
    </PageContainer>
  );
}
