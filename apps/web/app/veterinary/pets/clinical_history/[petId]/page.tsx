"use client";

import BackButton from "@/src/components/BackButton";
import { PageContainer } from "@/src/components/PageContainer";
import TableClinicalHistory from "@/src/features/clinical_history/components/TableClinicalHistories";
import { useClinicalHistoryFiles } from "@/src/features/clinical_history/hooks/useClinicalHistoryFiles";
import { editClinicalHistory } from "@/src/features/clinical_history/services/clinical_history.service";
import { usePet } from "@/src/features/pets/hooks/usePet";
import { downloadFile, removeFile } from "@/src/services/storage.service";
import { Avatar, Button, Card, Chip, Modal, Spinner } from "@heroui/react";
import { Download, Eye, FileText, Pencil, Plus, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Files = {
  name: string;
  path: string;
  isLoading: boolean;
};

export default function ClinicalHistoryPage() {
  const router = useRouter();
  const params = useParams<{ petId: string }>();
  const pet = usePet(params.petId);
  const [historyId, setHistoryId] = useState<string | null>(null);
  const { data } = useClinicalHistoryFiles(historyId as string);
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<Files[] | []>([]);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const remove = async (path: string, id: number) => {
    try {
      const { error } = await removeFile({
        from: "pet-medical-files",
        path,
      });

      if (error) return;

      const values = data?.attachments.filter((_: any, i: number) => i !== id);

      await editClinicalHistory({
        data: {
          attachments: values,
        },
        id: historyId as string,
      });

      toast.success("Archivo eliminado con éxito");
    } catch (error) {
      toast.error("No se pudó eliminar el archivo");
    } finally {
      closeModal();
    }

    //
    // toast.success("Archivo eliminado con exito");
  };

  const download = async (path: string, id: number) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === id ? { ...f, isLoading: true } : f)),
    );
    const { error, data } = await downloadFile({
      from: "pet-medical-files",
      path: path,
    });
    if (error) return;

    const url = URL.createObjectURL(data);

    const a = document.createElement("a");

    a.href = url;
    a.download = path;

    a.click();

    URL.revokeObjectURL(url);

    setFiles((prev) =>
      prev.map((f, i) => (i === id ? { ...f, isLoading: false } : f)),
    );
  };

  useEffect(() => {
    if (data?.attachments?.length) {
      setFiles(
        data?.attachments?.map((file: any) => ({
          name: file.name,
          path: file.path,
          isLoading: false,
        })),
      );
    }
  }, [data]);

  return (
    <PageContainer>
      <BackButton />
      <Modal isOpen={isOpen}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.CloseTrigger onPress={closeModal} />
              {/* Optional: Close button */}
              <Modal.Header>
                <Modal.Icon className="bg-default text-foreground">
                  <FileText />
                </Modal.Icon>
                <Modal.Heading>Archivos</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <ul className="flex flex-col gap-2">
                  {files?.map((file: any, i) => (
                    <li
                      key={file.path ?? file.name}
                      className="group flex items-center justify-between rounded-xl border border-default-200 bg-default-100 px-3 py-2 transition-colors hover:bg-default-200"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-default-200">
                          <FileText size={16} className="text-default-500" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium capitalize text-default-800">
                            {file.name}
                          </p>

                          {file.size && (
                            <span className="text-xs text-default-500">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="secondary"
                          isIconOnly
                          aria-label={`Descargar ${file.name}`}
                          onClick={() => download(file.path, i)}
                          isPending={file?.isLoading}
                        >
                          {({ isPending }) => (
                            <>
                              {isPending ? (
                                <Spinner size="sm" />
                              ) : (
                                <Download size={14} />
                              )}
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="danger-soft"
                          isIconOnly
                          onClick={() => remove(file.path, i)}
                          aria-label={`Eliminar ${file.name}`}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <div className="space-y-4 mb-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <h1 className="text-2xl font-bold">Historiales clínicos</h1>
          <Button
            onPress={() =>
              router.push(
                `/veterinary/pets/clinical_history/${params.petId}/new`,
              )
            }
          >
            <Plus />
            Nueva historial
          </Button>
        </div>
      </div>
      <Card className="mb-4 overflow-hidden">
        <Card.Header className="flex-col items-center gap-3 bg-default-50 border-b border-divider pb-5 pt-5">
          <Avatar className="size-18">
            <Avatar.Image alt={pet.data?.name} src={pet.data?.photo} />
            <Avatar.Fallback>
              {pet?.data?.name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("")}
            </Avatar.Fallback>
          </Avatar>
          <div className="flex flex-col items-center gap-1">
            <Card.Title className="text-lg">{pet.data?.name}</Card.Title>
            <Chip variant="soft" color="accent">
              {pet.data?.species}
            </Chip>
          </div>
        </Card.Header>

        <Card.Content className="p-0">
          <div className="grid grid-cols-3 divide-x divide-divider">
            <div className="flex flex-col items-center gap-1 py-4">
              <span className="text-xs text-default-400 uppercase tracking-wide">
                Edad
              </span>
              <p className="text-xl font-medium leading-none mt-1">
                {pet.data?.age}
                <span className="text-sm font-normal text-default-500 ml-1">
                  años
                </span>
              </p>
            </div>
            <div className="flex flex-col items-center gap-1 py-4">
              <span className="text-xs text-default-400 uppercase tracking-wide">
                Peso
              </span>
              <p className="text-xl font-medium leading-none mt-1">
                {pet.data?.weight}
                <span className="text-sm font-normal text-default-500 ml-1">
                  kg
                </span>
              </p>
            </div>
            <div className="flex flex-col items-center gap-1 py-4">
              <span className="text-xs text-default-400 uppercase tracking-wide">
                Sexo
              </span>
              <p className="text-xl font-medium leading-none mt-1">
                {pet.data?.sex === "male" ? "♂ Macho" : "♀ Hembra"}
              </p>
            </div>
          </div>
        </Card.Content>
      </Card>
      <TableClinicalHistory
        actionButtons={[
          {
            key: "edit",
            label: "Editar",
            description: "Editar historial",
            icon: <Pencil size={18} />,
            onClick: (id) => {
              router.push(
                `/veterinary/pets/clinical_history/${params.petId}/edit/${id}`,
              );
            },
          },
          {
            key: "files",
            label: "Archivos",
            description: "Ver archivos cargados",
            icon: <Eye size={18} />,
            onClick: (id) => {
              setHistoryId(id);
              openModal();
              // TODO: pagina de detalle del historial
              //
              //router.push(`/admin/owners_pets/edit/${id}`);
            },
          },
        ]}
      />
    </PageContainer>
  );
}
