import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type DemoRequestPayload = {
  name?: unknown;
  workEmail?: unknown;
  company?: unknown;
  scenarioId?: unknown;
  timeline?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getLeadTableName() {
  return process.env.SUPABASE_DEMO_REQUESTS_TABLE ?? "demo_requests";
}

function canPersistLead() {
  return Boolean(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function POST(request: Request) {
  let payload: DemoRequestPayload;

  try {
    payload = (await request.json()) as DemoRequestPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const { name, workEmail, company, scenarioId, timeline } = payload;

  if (!isNonEmptyString(name) || !isNonEmptyString(company)) {
    return NextResponse.json(
      { error: "Name and company are required." },
      { status: 400 }
    );
  }

  if (!isNonEmptyString(workEmail) || !isValidEmail(workEmail)) {
    return NextResponse.json(
      { error: "A valid work email is required." },
      { status: 400 }
    );
  }

  if (!isNonEmptyString(scenarioId) || !isNonEmptyString(timeline)) {
    return NextResponse.json(
      { error: "Scenario and timeline are required." },
      { status: 400 }
    );
  }

  const reference = `BA-${Date.now().toString(36).toUpperCase()}`;

  if (!canPersistLead()) {
    return NextResponse.json({
      success: true,
      persisted: false,
      reference,
    });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from(getLeadTableName()).insert({
      reference,
      name: name.trim(),
      work_email: workEmail.trim(),
      company: company.trim(),
      scenario_id: scenarioId.trim(),
      timeline: timeline.trim(),
    });

    if (error) {
      console.error("Failed to insert demo request:", error);
      return NextResponse.json(
        { error: "Failed to save demo request." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      persisted: true,
      reference,
    });
  } catch (error) {
    console.error("Demo request API error:", error);
    return NextResponse.json(
      { error: "Server error while saving demo request." },
      { status: 500 }
    );
  }
}
