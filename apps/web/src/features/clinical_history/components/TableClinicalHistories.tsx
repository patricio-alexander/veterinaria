import { EmptyState, Input, Pagination, Table } from "@heroui/react";
import { useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { Inbox } from "lucide-react";
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
import { useClinicalHistories } from "../hooks/useClinicalHistories";
import { useParams } from "next/navigation";

type ClinicalHistory = {
  id: string;
  reason: string;
  diagnosis: string;
  treatment: string;
  prescribed_medications: string;
  responsible_veterinarian_id: string;
  patientId: string;
};

type VeterinarianTableProps = {
  actionButtons: ButtonAction[];
};

export default function TableClinicalHistory({
  actionButtons,
}: VeterinarianTableProps) {
  const params = useParams<{ petId: string }>();

  const columnHelper = createColumnHelper<ClinicalHistory>();
  const columns = [
    columnHelper.accessor("reason", {
      header: "Razon",
    }),

    columnHelper.accessor("diagnosis", { header: "Diagnóstico" }),

    columnHelper.accessor("treatment", { header: "Tratamiento" }),

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

  const { data: clinicalHistories, isLoading } = useClinicalHistories({
    search: debouncedSearchTerm,
    page,
    petId: params.petId,
  });

  const table = useReactTable({
    columns,
    data: (clinicalHistories?.data as ClinicalHistory[]) ?? [],
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const pages = Array.from(
    { length: clinicalHistories?.totalPages ?? 0 },
    (_, i) => i + 1,
  );

  return (
    <>
      <div className="flex justify-between mb-4">
        <Input
          placeholder="Buscar historial por razón"
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
                {clinicalHistories?.total ?? 0} results
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
