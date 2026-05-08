// app/api/users/create/route.ts
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const photo = formData.get("photo") as File;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const licenseNumber = formData.get("license_number") as string;
    const specialty = formData.get("specialty") as string;
    const phone = formData.get("phone") as string;

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    });

    if (error) {
      if (error.code === "user_already_exists") {
        return NextResponse.json(
          { error: "El veterinario ya existe" },
          { status: 400 },
        );
      }
    }

    const { data: userFound } = await supabaseAdmin
      .from("profiles")
      .select()
      .eq("email", email)
      .single();

    if (userFound) {
      return NextResponse.json(
        { error: "El veterinario ya existe" },
        { status: 409 },
      );
    }

    let photoUrl = null;
    if (photo) {
      const bytes = await photo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const { data: storageData, error: storageError } =
        await supabaseAdmin.storage
          .from("avatars")
          .upload(`${data?.user?.id}/avatar.jpg`, buffer, {
            contentType: photo.type,
            upsert: true,
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

    const { data: profileData, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: data?.user?.id,
        name: name,
        email: email,
        role: "veterinarian",
        photo: photoUrl,
      })
      .select()
      .single();

    if (profileErr) {
      return NextResponse.json({ error: profileErr.message }, { status: 400 });
    }

    const { error: vetError } = await supabaseAdmin
      .from("veterinarians")
      .insert({
        license_number: licenseNumber,
        specialty: specialty,
        phone: phone,
        profile_id: profileData.id,
      });

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
