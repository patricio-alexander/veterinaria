import { VeterinarianFormData } from "../components/VeterinarianForm";

export const addVeterinarian = async (veterinarian: VeterinarianFormData) => {
  const formData = new FormData();

  for (const key in veterinarian) {
    const value = veterinarian[key as keyof VeterinarianFormData];
    if (value !== null && value !== undefined) {
      formData.append(key, value as string | Blob);
    }
  }

  if (veterinarian.photo instanceof File) {
    formData.append("photo", veterinarian.photo);
  }

  const res = await fetch("/api/users/create", {
    method: "POST",
    body: formData,
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error);
  }
};
