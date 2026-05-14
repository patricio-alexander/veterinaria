import { useState } from "react";
import { FileText, X } from "lucide-react";
import { Button, Chip } from "@heroui/react";
import z from "zod";

export const FileEntrySchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("new"), file: z.instanceof(File) }),
  z.object({ type: z.literal("existing"), name: z.string(), path: z.string() }),
]);
export type FileEntry = z.infer<typeof FileEntrySchema>;

type FilePickerProps = {
  onPick: (files: FileEntry[]) => void;
  value?: FileEntry[];
};

export default function FilePicker({ onPick, value = [] }: FilePickerProps) {
  const [files, setFiles] = useState<FileEntry[]>(value);

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      const mapped = selectedFiles.map((f) => ({
        file: f,
        type: "new" as const,
      }));
      const newFiles = [...files, ...mapped];
      setFiles(newFiles);
      onPick(newFiles);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onPick(newFiles);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="cursor-pointer">
        <div className="border-2 border-dashed border-default-300 rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors">
          <FileText className="w-8 h-8 text-default-400" />
          <span className="text-sm text-default-500">
            Agregar archivos (PDF, imágenes)
          </span>
        </div>
        <input
          type="file"
          multiple
          accept="image/*,.pdf"
          className="hidden"
          onChange={onSelect}
        />
      </label>

      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((file, index) => (
            <li
              key={index}
              className="flex items-center justify-between bg-default-100 p-2 rounded-md"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText
                  size={16}
                  className="text-default-400 flex-shrink-0"
                />
                <span className="text-sm truncate">
                  {file.type === "new" ? file.file.name : file.name}
                </span>
                <Chip color={file.type === "new" ? "success" : "accent"}>
                  {file.type === "new" ? "Nuevo" : "Existente"}
                </Chip>
              </div>
              <Button
                size="sm"
                variant="danger-soft"
                onClick={() => removeFile(index)}
                isIconOnly
              >
                <X size={14} />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
