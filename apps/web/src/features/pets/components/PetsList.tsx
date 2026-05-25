import { useDebounce } from "@uidotdev/usehooks";
import { useState } from "react";
import { usePets } from "../hooks/usePets";

import {
  EmptyState,
  Input,
  Pagination,
  Skeleton,
  Table,
  Tabs,
} from "@heroui/react";
import { type ButtonAction } from "@/src/components/ActionsButton";
import PetCard from "./PetCard";
import { useSpecies } from "../hooks/useSpecies";
import { Bone } from "lucide-react";

export default function PetsList({
  actionButtons,
}: {
  actionButtons: ButtonAction[];
}) {
  const [search, setSearch] = useState("");

  const debouncedSearchTerm = useDebounce(search, 300);
  const [filter, setFilter] = useState<number | null>(null);

  const [page, setPage] = useState(1);

  const { data: pets, isLoading: isLoadingPets } = usePets({
    search: debouncedSearchTerm,
    page,
    filterBySpecie: filter,
  });

  const nextPage = () => {
    setPage((p) => p + 1);
  };

  const previousPage = () => {
    setPage((p) => Math.max(1, p - 1));
  };

  const pages = Array.from({ length: pets?.totalPages ?? 0 }, (_, i) => i + 1);
  const { data: species } = useSpecies();

  return (
    <>
      <div className="flex justify-between mb-4 ">
        <Input
          placeholder="Buscar mascotas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-xl"
        />
      </div>

      <Tabs
        className="mb-4"
        onSelectionChange={(key) => {
          if (key === "all") {
            setFilter(null);
            return;
          }
          setFilter(key);
        }}
      >
        <Tabs.ListContainer>
          <Tabs.List
            aria-label="Options"
            className="w-fit *:h-6 *:w-fit *:px-3 *:text-sm *:font-normal *:data-[selected=true]:text-accent-foreground"
          >
            <Tabs.Tab id="all">
              Todas las mascotas
              <Tabs.Indicator className="bg-zinc-900" />
            </Tabs.Tab>

            {species?.data.map((specie) => (
              <Tabs.Tab id={specie.id} key={specie.id}>
                {specie.name}
                <Tabs.Indicator className="bg-zinc-900" />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>
      <div className="pets flex flex-wrap gap-6">
        {isLoadingPets && (
          <>
            <div className="shadow-panel w-[200px] space-y-5 rounded-2xl  bg-transparent p-4 border">
              <Skeleton className="w-full rounded-lg aspect-square " />
              <div className="space-y-3">
                <Skeleton className="h-3 w-3/5 rounded-lg" />
                <Skeleton className="h-3 w-4/5 rounded-lg" />
                <Skeleton className="h-3 w-2/5 rounded-lg" />
              </div>
            </div>
            <div className="shadow-panel w-[200px] space-y-5 rounded-2xl  bg-transparent p-4 border">
              <Skeleton className="w-full rounded-lg aspect-square " />
              <div className="space-y-3">
                <Skeleton className="h-3 w-3/5 rounded-lg" />
                <Skeleton className="h-3 w-4/5 rounded-lg" />
                <Skeleton className="h-3 w-2/5 rounded-lg" />
              </div>
            </div>
          </>
        )}

        {!pets?.data?.length ? (
          <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
            <Bone />
            <span className="text-sm text-muted">No hay mascotas</span>
          </EmptyState>
        ) : (
          pets.data?.map((p, i) => (
            <PetCard pet={p} key={i} actionButtons={actionButtons} />
          ))
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-40">
        <Pagination size="sm">
          <Pagination.Summary>{pets?.total ?? 0} results</Pagination.Summary>
          <Pagination.Content>
            <Pagination.Item>
              <Pagination.Previous
                isDisabled={page === 1 || !!pages.length}
                onPress={() => previousPage()}
              >
                <Pagination.PreviousIcon />
                Anterior
              </Pagination.Previous>
            </Pagination.Item>
            {pages.map((p) => (
              <Pagination.Item key={p}>
                <Pagination.Link
                  isActive={p === page}
                  onPress={() => setPage(p)}
                >
                  {p}
                </Pagination.Link>
              </Pagination.Item>
            ))}
            <Pagination.Item>
              <Pagination.Next
                isDisabled={page === pages.length || !pages.length}
                onPress={() => nextPage()}
              >
                Siguiente
                <Pagination.NextIcon />
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
      </div>
    </>
  );
}
