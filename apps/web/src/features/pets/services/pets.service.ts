import { supabase } from "@/lib/supabase/client";
import { PetsFormData } from "../components/PetsForm";

export const getPet = async (id: string) => {
  const { data, error } = await supabase
    .from("patients")
    .select("*, owner_patients(id)")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    name: data.name,
    species: data.species,
    breed: data.breed,
    sex: data.sex,
    age: data.age,
    weight: data.weight,
    photo: data.profile_photo,
    owner: data.owner_patients.id,
  };
};

export const editPet = async (pet: PetsFormData, id: string) => {
  const { name, species, breed, sex, age, weight, owner, photo } = pet;

  const { error } = await supabase
    .from("patients")
    .update({
      name,
      species,
      breed,
      sex,
      age,
      weight,

      owner_id: owner,
    })
    .eq("id", id);

  if (photo instanceof File) {
    const { data: dataUpload, error: errorUpload } = await supabase.storage
      .from("pets")
      .upload(`${id}/profile.jpg`, photo, {
        upsert: true,
      });

    const {
      data: { publicUrl },
    } = supabase.storage.from("pets").getPublicUrl(dataUpload.path);

    await supabase
      .from("patients")
      .update({
        profile_photo: publicUrl,
      })
      .eq("id", id);

    if (errorUpload) {
      throw new Error(errorUpload.message);
    }
  }

  if (error) {
    throw new Error(error.message);
  }
};

export const addPet = async (pet: PetsFormData) => {
  const { name, species, breed, sex, age, weight, owner, photo } = pet;

  const { data, error } = await supabase
    .from("patients")
    .insert({
      name,
      species,
      breed,
      sex,
      age,
      weight,
      owner_id: owner,
    })
    .select()
    .single();

  if (error) {
    return;
  }

  if (photo) {
    const { data: upload, error: errorUpload } = await supabase.storage
      .from("pets")
      .upload(`${data?.id}/profile.jpg`, photo);

    if (errorUpload) {
      throw new Error("Hubo erro al subir la foto");
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("pets").getPublicUrl(upload.path);

    const { error: errorUpdate } = await supabase
      .from("patients")
      .update({
        profile_photo: publicUrl,
      })
      .eq("id", data.id);

    if (errorUpdate) {
      throw new Error("Hubo error al agregar la foto");
    }
  }
};
