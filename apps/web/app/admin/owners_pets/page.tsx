"use client";

import { PageContainer } from "@/src/components/PageContainer";
import OwnerPetsTable from "@/src/features/owners_pets/components/OwnerPetsTable";
import { Button } from "@heroui/react";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function OwnerPetsPage() {
  return (
    <PageContainer>
      <div className="space-y-4 mb-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <h1 className="text-2xl font-bold">Dueños</h1>
          <Link href="/admin/owners_pets/new">
            <Button>
              <Plus />
              Nueva dueño
            </Button>
          </Link>
        </div>
      </div>
      <OwnerPetsTable />
    </PageContainer>
  );
}
