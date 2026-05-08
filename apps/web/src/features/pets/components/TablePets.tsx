import { useDebounce } from "@uidotdev/usehooks";
import { useState } from "react";
import { usePets } from "../hooks/usePets";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
// Opción 1: Importar el tipo
import { type Pets } from "@reservacion-veterinaria/types";
import { Avatar, EmptyState, Input, Pagination, Table } from "@heroui/react";
import ActionsButtons, {
  type ButtonAction,
} from "@/src/components/ActionsButton";
import { Inbox, Pencil } from "lucide-react";

type TablePetsProps = {
  actionButtons: ButtonAction[];
};

export default function TablePets({ actionButtons }: TablePetsProps) {
  const columnHelper = createColumnHelper<Pets>();

  const columns = [
    columnHelper.accessor("profile_photo", {
      cell: (info) => (
        <Avatar size="sm">
          <Avatar.Image src={info?.getValue()} />
          <Avatar.Fallback>
            {info?.row.original.name
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")}
          </Avatar.Fallback>
        </Avatar>
      ),

      header: "Foto",
    }),

    columnHelper.accessor("name", { header: "Nombre" }),

    columnHelper.accessor("sex", {
      header: "Sexo",
      cell: (info) =>
        info.row.original.sex === "male" ? "Masculino" : "Femenino",
    }),

    columnHelper.accessor("age", { header: "Edad" }),
    columnHelper.accessor("weight", { header: "Peso (kg)" }),

    columnHelper.accessor("id", {
      header: "Acciones",
      cell: (info) => (
        <ActionsButtons
          buttons={actionButtons?.map((btn) => ({
            ...btn,
            onClick: () => btn.onClick(info.row.original.id),
          }))}
        />
      ),
    }),
  ];

  const [search, setSearch] = useState("");

  const debouncedSearchTerm = useDebounce(search, 300);

  const [page, setPage] = useState(1);

  const { data: pets, isLoading } = usePets({
    search: debouncedSearchTerm,
    page,
  });

  const table = useReactTable({
    columns,
    data: (pets?.data as Pets[]) ?? [],
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const nextPage = () => {
    setPage((p) => p + 1);
  };

  const previousPage = () => {
    setPage((p) => Math.max(1, p - 1));
  };

  const pages = Array.from({ length: pets?.totalPages ?? 0 }, (_, i) => i + 1);

  return (
    <>
      <div className="flex justify-between mb-4">
        <Input
          placeholder="Buscar mascotas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-xl"
        />
      </div>
      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label="Team members" className="min-w-[600px]">
            <Table.Header>
              {table.getHeaderGroups()[0]!.headers.map((header) => (
                <Table.Column key={header.id} isRowHeader={header.id === "id"}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </Table.Column>
              ))}
            </Table.Header>
            <Table.Body
              renderEmptyState={() => (
                <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                  <Inbox />
                  <span className="text-sm text-muted">No hay mascotas</span>
                </EmptyState>
              )}
            >
              {table?.getRowModel()?.rows?.map((row) => (
                <Table.Row key={row.id} id={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <Table.Cell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
          <Table.Footer>
            <Pagination size="sm">
              <Pagination.Summary>
                {pets?.total ?? 0} results
              </Pagination.Summary>
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
          </Table.Footer>
        </Table.ScrollContainer>
      </Table>
    </>
  );
}
