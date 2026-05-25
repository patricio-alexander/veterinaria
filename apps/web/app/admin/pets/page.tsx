"use client";

import { PageContainer } from "@/src/components/PageContainer";
import PetsList from "@/src/features/pets/components/PetsList";
import { Button } from "@heroui/react";
import { Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PetsPage() {
  const router = useRouter();

  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <h1 className="text-2xl font-bold">Mascotas</h1>
          <Button onPress={() => router.push("/admin/pets/new")}>
            <Plus />
            Nueva mascota
          </Button>
        </div>
      </div>

      <PetsList
        actionButtons={[
          {
            label: "Editar",
            key: "edit",
            description: "Editart item",
            icon: <Pencil size={18} />,
            onClick: (id: string) => {
              router.push(`/admin/pets/edit/${id}`);
            },
          },
        ]}
      />
    </PageContainer>
  );
}
