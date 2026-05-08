import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          error: "El ID del dueño es requerido",
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { name, phone, address } = body;

    const { data: owner, error: errorOwner } = await supabaseAdmin
      .from("owner_patients")
      .update({
        address,
        phone,
      })
      .eq("id", id)
      .select()
      .single();

    if (errorOwner) {
      return NextResponse.json({ error: errorOwner.message }, { status: 400 });
    }

    const { error: errorProfile } = await supabaseAdmin
      .from("profiles")
      .update({
        name,
      })
      .eq("id", owner.profile_id);

    if (errorProfile) {
      return NextResponse.json(
        { error: errorProfile.message },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: `Error interno del servidor ${error}` },
      { status: 500 },
    );
  }
}
