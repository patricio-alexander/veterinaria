import { Camera } from "lucide-react";
import { useState } from "react";

type ImagePickerProps = {
  onPick: (file: File) => void;
  value?: string;
};

export default function ImagePicker({ onPick, value }: ImagePickerProps) {
  const [photo, setPhoto] = useState<string | null>(value ?? "");

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      //setValue("photo", file);
      onPick(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    //setValue("photo", undefined);
    setPhoto(null);
  };

  return (
    <>
      <label className="relative cursor-pointer group">
        <div className="w-32 h-32 rounded-full bg-default-100 border-2 border-dashed border-default-300 flex items-center justify-center overflow-hidden group-hover:border-primary transition-colors">
          {photo ? (
            <img
              src={photo}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <Camera className="w-10 h-10 text-default-400 group-hover:text-primary transition-colors" />
          )}
        </div>
        <div className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg group-hover:bg-primary-600 transition-colors">
          <Camera size={16} className="text-slate-900" />
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onSelect}
        />
      </label>
      {photo && (
        <button
          type="button"
          onClick={removePhoto}
          className="text-danger text-sm hover:underline"
        >
          Eliminar foto
        </button>
      )}
    </>
  );
}
