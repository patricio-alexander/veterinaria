"use client";

import { PageContainer } from "@/src/components/PageContainer";
import OwnerPetsTable from "@/src/features/owners_pets/components/OwnerPetsTable";
import { Button } from "@heroui/react";
import { Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OwnerPetsPage() {
  const router = useRouter();
  return (
    <PageContainer>
      <div className="space-y-4 mb-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <h1 className="text-2xl font-bold">Dueños</h1>
          <Button onPress={() => router.push("/admin/owners_pets/new")}>
            <Plus />
            Nueva dueño
          </Button>
        </div>
      </div>
      <OwnerPetsTable
        actionButtons={[
          {
            key: "edit",
            label: "Editar",
            description: "Editar item",
            icon: <Pencil size={18} />,
            onClick: (id) => {
              router.push(`/admin/owners_pets/edit/${id}`);
            },
          },
        ]}
      />
    </PageContainer>
  );
}
