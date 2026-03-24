import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getOperatorApplicationsTable() {
  return process.env.SUPABASE_OPERATOR_APPLICATIONS_TABLE ?? "operator_applications";
}

export async function POST(req: Request) {
  let payload: unknown;

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const body = payload as Record<string, unknown> | null;
  const name = body?.name;
  const email = body?.email;
  const country = body?.country;

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

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from(getOperatorApplicationsTable())
      .insert({
        name: name.trim(),
        email: email.trim(),
        country: country.trim(),
      });

    if (error) {
      console.error("Failed to insert operator application:", error);
      return NextResponse.json(
        { error: "Failed to save application." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Operator apply API error:", error);
    return NextResponse.json(
      { error: "Server error while saving application." },
      { status: 500 }
    );
  }
}
