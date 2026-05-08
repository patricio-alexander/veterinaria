import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone, address } = body;

    const { data: account, error: errorAccount } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
      });

    if (errorAccount) {
      if (errorAccount.code === "user_already_exists") {
        return NextResponse.json(
          {
            error: "El dueño ya existe",
          },
          { status: 400 },
        );
      }
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: account.user?.id,
        name,
        email,
        role: "owner_pet",
      })
      .select()
      .single();

    await supabaseAdmin.from("owner_patients").insert({
      phone,
      address,
      profile_id: profile.id,
    });

    return NextResponse.json(
      {
        sucess: true,
      },
      { status: 200 },
    );
  } catch (error) {
    NextResponse.json({
      error,
      status: 500,
    });
  }
}
