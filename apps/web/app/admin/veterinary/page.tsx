"use client";

import { Button } from "@heroui/react";
import { Calendar, Pencil, Plus, Trash } from "lucide-react";
import Link from "next/link";
import { PageContainer } from "@/src/components/PageContainer";
import VeterinarianTable from "@/src/features/veterinarians/components/VeterinarianTable";
import { useRouter } from "next/navigation";

export default function VeterinaryPage() {
  const router = useRouter();

  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <h1 className="text-2xl font-bold">Veterinarios</h1>
          <Link href="/admin/veterinary/new">
            <Button>
              <Plus />
              Nuevo Veterinario
            </Button>
          </Link>
        </div>
        <VeterinarianTable
          actionButtons={[
            {
              label: "Calendario",
              key: "calendar",
              description: "Ver calendario",
              icon: <Calendar className="size-4 shrink-0 text-muted" />,
              onClick: (id) => {
                router.push(`/admin/veterinary/calendar/${id}`);
              },
            },
            {
              label: "Editar",
              key: "edit",
              description: "Editart veterinario",
              icon: <Pencil className="size-4 shrink-0 text-muted" />,
              onClick: (id) => {
                router.push(`/admin/veterinary/edit/${id}`);
              },
            },
            {
              label: "Eliminar",
              key: "delete",
              description: "Eliminar veterinario",
              icon: <Trash className="size-4 shrink-0 text-danger" />,

              variant: "danger",
              onClick: (router) => {},
            },
          ]}
        />
      </div>
    </PageContainer>
  );
}
