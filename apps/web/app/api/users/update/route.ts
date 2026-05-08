// app/api/users/update/route.ts
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "El ID del veterinario es requerido" },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    const photo = formData.get("photo") as File | null;

    const name = formData.get("name") as string;
    const licenseNumber = formData.get("license_number") as string;
    const specialty = formData.get("specialty") as string;
    const phone = formData.get("phone") as string;

    const { data: veterinarian, error: vetFetchError } = await supabaseAdmin
      .from("veterinarians")
      .select("profile_id")
      .eq("id", id)
      .single();

    if (vetFetchError) {
      return NextResponse.json(
        { error: "Veterinario no encontrado" },
        { status: 404 },
      );
    }

    const profileId = veterinarian.profile_id;

    let photoUrl = null;

    if (photo && photo.size > 0) {
      const bytes = await photo.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Primero eliminar el archivo existente
      await supabaseAdmin.storage
        .from("avatars")
        .remove([`${profileId}/avatar.jpg`]);

      const { data: storageData, error: storageError } =
        await supabaseAdmin.storage
          .from("avatars")
          .upload(`${profileId}/avatar.jpg`, buffer, {
            contentType: photo.type,
          });

      if (!storageError) {
        const {
          data: { publicUrl },
        } = supabaseAdmin.storage
          .from("avatars")
          .getPublicUrl(storageData.path);

        photoUrl = publicUrl;
      }
    }

    const updateData: Record<string, unknown> = {
      name: name,
    };

    if (photoUrl) {
      updateData.photo = photoUrl;
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update(updateData)
      .eq("id", profileId);

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 },
      );
    }

    const { error: vetError } = await supabaseAdmin
      .from("veterinarians")
      .update({
        license_number: licenseNumber,
        specialty: specialty,
        phone: phone,
      })
      .eq("id", id);

    if (vetError) {
      return NextResponse.json({ error: vetError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: `Error interno del servidor ${error}` },
      { status: 500 },
    );
  }
}
