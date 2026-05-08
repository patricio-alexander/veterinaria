import { Avatar, EmptyState, Input, Pagination, Table } from "@heroui/react";
import { useState } from "react";
import { useVeterinarians } from "../hooks/useVeterinarians";
import { useDebounce } from "@uidotdev/usehooks";
import { Calendar, Inbox, Pencil, Trash } from "lucide-react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import ActionsButtons, {
  type ButtonAction,
} from "@/src/components/ActionsButton";

type Veterinarian = {
  profiles: {
    name: string;
    email: string;
    photo: string | null;
  };
  id: string;
  license_number: string;
  specialty: string;
  phone: string;
};

type VeterinarianTableProps = {
  actionButtons: ButtonAction[];
};

export default function VeterinarianTable({
  actionButtons,
}: VeterinarianTableProps) {
  const columnHelper = createColumnHelper<Veterinarian>();
  const columns = [
    columnHelper.accessor("license_number", { header: "Licencia" }),

    columnHelper.accessor("profiles.photo", {
      cell: (info) => (
        <Avatar size="sm">
          <Avatar.Image src={info?.getValue()} />
          <Avatar.Fallback>
            {info?.row.original.profiles.name
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")}
          </Avatar.Fallback>
        </Avatar>
      ),

      header: "Foto",
    }),

    columnHelper.accessor("profiles.name", {
      header: "Nombre",
    }),

    columnHelper.accessor("specialty", { header: "Especialidad" }),

    columnHelper.accessor("profiles.email", { header: "Correo" }),

    columnHelper.accessor("id", {
      header: "Acciones",
      cell: (info) => (
        <ActionsButtons
          buttons={actionButtons?.map((btn) => ({
            ...btn,
            onClick: () => btn.onClick(info.row.original.id),
          }))}
          // onEdit={(router) => {

          // }}
        />
      ),
    }),
  ];

  const [search, setSearch] = useState("");

  const debouncedSearchTerm = useDebounce(search, 300);

  const [page, setPage] = useState(1);

  const nextPage = () => {
    setPage((p) => p + 1);
  };

  const previousPage = () => {
    setPage((p) => Math.max(1, p - 1));
  };

  const { data: veterinarians, isLoading } = useVeterinarians({
    search: debouncedSearchTerm,
    page,
  });

  const table = useReactTable({
    columns,
    data: (veterinarians?.data as Veterinarian[]) ?? [],
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const pages = Array.from(
    { length: veterinarians?.totalPages ?? 0 },
    (_, i) => i + 1,
  );

  return (
    <>
      <div className="flex justify-between">
        <Input
          placeholder="Buscar veterinarios por numero de licencia"
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
                <Table.Column
                  key={header.id}
                  isRowHeader={header.id === "license_number"}
                >
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
                  <span className="text-sm text-muted">
                    No hay veterinarios
                  </span>
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
                {veterinarians?.total ?? 0} results
              </Pagination.Summary>
              <Pagination.Content>
                <Pagination.Item>
                  <Pagination.Previous
                    isDisabled={page === 1}
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
                    isDisabled={page === pages.length}
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
