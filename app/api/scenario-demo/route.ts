import { NextRequest, NextResponse } from "next/server";
import { parseScenarioInput, runScenarioSimulation } from "@/lib/mvp/scenarios";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const input = parseScenarioInput({
    scenarioId: searchParams.get("scenarioId") ?? undefined,
    facilities: searchParams.get("facilities") ?? undefined,
    monthlyRevenueAtRisk: searchParams.get("monthlyRevenueAtRisk") ?? undefined,
    delayWeeks: searchParams.get("delayWeeks") ?? undefined,
  });

  return NextResponse.json({
    input,
    simulation: runScenarioSimulation(input),
    generatedAt: new Date().toISOString(),
  });
}
