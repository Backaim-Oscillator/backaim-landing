import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isApplicantRole(v: unknown): v is "Operator" | "Partner" {
  return v === "Operator" || v === "Partner";
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const obj = body as Record<string, unknown> | null;
  const name = obj?.name;
  const email = obj?.email;
  const country = obj?.country;
  const role = obj?.role;

  if (!isNonEmptyString(name) || !isNonEmptyString(country)) {
    return NextResponse.json(
      { error: "Name and country are required." },
      { status: 400 }
    );
  }

  if (!isNonEmptyString(email) || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "A valid email address is required." },
      { status: 400 }
    );
  }

  if (!isApplicantRole(role)) {
    return NextResponse.json({ error: "A valid role is required." }, { status: 400 });
  }

  const table =
    process.env.SUPABASE_OPERATOR_APPLICATIONS_TABLE ?? "operator_applications";

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from(table)
      .insert({
        name: name.trim(),
        email: email.trim(),
        country: country.trim(),
        role,
      });

    if (error) {
      console.error("Supabase insert failed:", error);
      return NextResponse.json(
        { error: "Failed to save application." },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("Supabase error:", err);
    return NextResponse.json(
      { error: "Server error while saving application." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

