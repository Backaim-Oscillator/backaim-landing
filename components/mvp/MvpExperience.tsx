"use client";

import Image from "next/image";
import { type FormEvent, useState, useTransition } from "react";
import {
  getDefaultScenarioInput,
  runScenarioSimulation,
  scenarioCatalog,
  type ScenarioId,
  type ScenarioInput,
  type ScenarioSimulation,
} from "@/lib/mvp/scenarios";

type DemoFormState = {
  name: string;
  workEmail: string;
  company: string;
  timeline: string;
};

function metricLabel(id: string) {
  return scenarioCatalog.find((scenario) => scenario.id === id)?.name ?? id;
}

export default function MvpExperience() {
  const [scenarioInput, setScenarioInput] = useState<ScenarioInput>(
    getDefaultScenarioInput()
  );
  const [simulation, setSimulation] = useState<ScenarioSimulation>(
    runScenarioSimulation(getDefaultScenarioInput())
  );
  const [copyState, setCopyState] = useState("Copy scenario narrative");
  const [leadState, setLeadState] = useState<DemoFormState>({
    name: "",
    workEmail: "",
    company: "",
    timeline: "Within 30 days",
  });
  const [leadError, setLeadError] = useState<string | null>(null);
  const [leadSuccess, setLeadSuccess] = useState<string | null>(null);
  const [isScenarioPending, startScenarioTransition] = useTransition();
  const [isLeadPending, startLeadTransition] = useTransition();

  async function runSimulation(nextInput: ScenarioInput) {
    startScenarioTransition(async () => {
      try {
        const params = new URLSearchParams({
          scenarioId: nextInput.scenarioId,
          facilities: String(nextInput.facilities),
          monthlyRevenueAtRisk: String(nextInput.monthlyRevenueAtRisk),
          delayWeeks: String(nextInput.delayWeeks),
        });

        const response = await fetch(`/api/scenario-demo?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Simulation request failed.");
        }

        const data = (await response.json()) as {
          simulation: ScenarioSimulation;
        };
        setSimulation(data.simulation);
      } catch {
        setSimulation(runScenarioSimulation(nextInput));
      }
    });
  }

  function updateScenario(
    patch: Partial<ScenarioInput>,
    options?: { resetToDefaults?: boolean }
  ) {
    const nextScenarioId = (patch.scenarioId ??
      scenarioInput.scenarioId) as ScenarioId;
    const template = scenarioCatalog.find((scenario) => scenario.id === nextScenarioId);

    const nextInput: ScenarioInput =
      options?.resetToDefaults && template
        ? { scenarioId: template.id, ...template.defaults }
        : {
            ...scenarioInput,
            ...patch,
            scenarioId: nextScenarioId,
          };

    setScenarioInput(nextInput);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(simulation.copyBlock);
      setCopyState("Copied");
      window.setTimeout(() => setCopyState("Copy scenario narrative"), 1600);
    } catch {
      setCopyState("Copy failed");
      window.setTimeout(() => setCopyState("Copy scenario narrative"), 1600);
    }
  }

  function handleLeadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLeadError(null);
    setLeadSuccess(null);

    if (!leadState.name || !leadState.workEmail || !leadState.company) {
      setLeadError("Complete the form before requesting a live build.");
      return;
    }

    startLeadTransition(async () => {
      try {
        const response = await fetch("/api/demo-request", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...leadState,
            scenarioId: scenarioInput.scenarioId,
          }),
        });

        const data = (await response.json()) as
          | { success: true; reference: string }
          | { error?: string };

        if (!response.ok || !("success" in data)) {
          const message = "error" in data ? data.error : undefined;
          setLeadError(message ?? "Failed to submit demo request.");
          return;
        }

        setLeadSuccess(`Request received. Reference ${data.reference}.`);
        setLeadState((current) => ({
          ...current,
          name: "",
          workEmail: "",
          company: "",
        }));
      } catch {
        setLeadError("Network error while submitting demo request.");
      }
    });
  }

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-20 h-[720px] bg-[radial-gradient(circle_at_top_left,_rgba(168,255,120,0.22),_transparent_42%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_30%),linear-gradient(180deg,_#08110d_0%,_#0b1410_46%,_#f5f1e8_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(180deg,black,transparent_82%)]" />

      <section className="mx-auto flex w-full max-w-7xl flex-col px-5 pb-14 pt-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 text-sm text-white/72">
          <div className="font-medium tracking-[0.28em] text-white">BACKAIM OS</div>
          <div className="hidden gap-6 md:flex">
            <a href="#studio">Scenario Studio</a>
            <a href="#stack">Product Stack</a>
            <a href="#live-build">Live Build</a>
          </div>
        </div>

        <div className="grid gap-10 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:py-[4.5rem]">
          <div className="max-w-4xl">
            <div className="inline-flex rounded-full border border-lime-300/25 bg-lime-200/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-lime-100">
              Frontend + backend MVP, not a brochure
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.94] tracking-[-0.04em] text-white sm:text-7xl">
              Simulate the sale, quantify the edge, and hand buyers copy they can use.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
              This build turns Backaim into a product surface: live infrastructure
              scenarios, API-backed commercial outputs, and a request flow that
              can persist instantly when Supabase is configured.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#studio"
                className="rounded-full bg-[var(--brand-lime)] px-6 py-3 text-sm font-semibold text-[#041008] transition-transform hover:-translate-y-0.5"
              >
                Run live scenario
              </a>
              <a
                href="#live-build"
                className="rounded-full border border-white/16 px-6 py-3 text-sm font-semibold text-white/84 transition-colors hover:border-white/34 hover:text-white"
              >
                Book live build
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="glass-panel rounded-[28px] p-5">
                <div className="text-xs uppercase tracking-[0.26em] text-white/42">
                  API Surface
                </div>
                <div className="mt-2 text-3xl font-semibold text-white">2 routes</div>
                <p className="mt-2 text-sm leading-6 text-white/64">
                  One route simulates the commercial case. One captures the live build request.
                </p>
              </div>
              <div className="glass-panel rounded-[28px] p-5">
                <div className="text-xs uppercase tracking-[0.26em] text-white/42">
                  Scenario Depth
                </div>
                <div className="mt-2 text-3xl font-semibold text-white">3 plays</div>
                <p className="mt-2 text-sm leading-6 text-white/64">
                  Compute expansion, greenhouse margin defense, and curtailment recovery.
                </p>
              </div>
              <div className="glass-panel rounded-[28px] p-5">
                <div className="text-xs uppercase tracking-[0.26em] text-white/42">
                  Sales Output
                </div>
                <div className="mt-2 text-3xl font-semibold text-white">Copy ready</div>
                <p className="mt-2 text-sm leading-6 text-white/64">
                  Generated narrative buyers can paste into internal threads or deal memos.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[34px] bg-lime-200/14 blur-3xl" />
            <div className="relative overflow-hidden rounded-[34px] border border-white/12 bg-[#101915]/80 p-4 shadow-[0_32px_100px_rgba(3,8,6,0.45)] backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between rounded-[24px] border border-white/10 bg-black/18 px-4 py-3 text-xs uppercase tracking-[0.24em] text-white/48">
                <span>Live operator view</span>
                <span>{simulation.urgencyLabel}</span>
              </div>
              <Image
                src="/images/Operator dashboard U.png"
                alt="Backaim operator dashboard interface"
                width={1200}
                height={900}
                className="rounded-[26px] border border-white/10 object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section
        id="studio"
        className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10"
      >
        <div className="rounded-[36px] border border-black/8 bg-white/76 p-6 shadow-[0_20px_80px_rgba(16,24,20,0.08)] backdrop-blur md:p-8">
          <div className="text-xs uppercase tracking-[0.32em] text-[var(--ink-soft)]">
            Scenario Studio
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--ink)]">
            Choose the buyer story and run the numbers.
          </h2>
          <p className="mt-3 text-base leading-7 text-[var(--ink-soft)]">
            This is the MVP core: one interface for selecting a real operating
            pressure, modeling the impact, and returning a commercial story with
            measurable upside.
          </p>

          <div className="mt-8 grid gap-3">
            {scenarioCatalog.map((scenario) => {
              const active = scenario.id === scenarioInput.scenarioId;
              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() =>
                    updateScenario({ scenarioId: scenario.id }, { resetToDefaults: true })
                  }
                  className={`rounded-[24px] border px-5 py-4 text-left transition-all ${
                    active
                      ? "border-[var(--brand-lime)] bg-[var(--brand-lime)]/12 shadow-[0_16px_40px_rgba(133,255,92,0.16)]"
                      : "border-black/8 bg-black/[0.02] hover:border-black/18 hover:bg-black/[0.03]"
                  }`}
                >
                  <div className="text-lg font-semibold text-[var(--ink)]">
                    {scenario.name}
                  </div>
                  <div className="mt-1 text-sm text-[var(--ink-soft)]">
                    {scenario.tagline}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 space-y-6">
            <label className="block">
              <div className="flex items-center justify-between text-sm font-medium text-[var(--ink)]">
                <span>Sites or facilities</span>
                <span>{scenarioInput.facilities}</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={scenarioInput.facilities}
                onChange={(event) =>
                  updateScenario({ facilities: Number(event.target.value) })
                }
                className="mt-3 w-full accent-[var(--brand-lime-deep)]"
              />
            </label>

            <label className="block">
              <div className="flex items-center justify-between text-sm font-medium text-[var(--ink)]">
                <span>Monthly value at risk</span>
                <span>${scenarioInput.monthlyRevenueAtRisk.toLocaleString("en-US")}</span>
              </div>
              <input
                type="range"
                min="50000"
                max="5000000"
                step="50000"
                value={scenarioInput.monthlyRevenueAtRisk}
                onChange={(event) =>
                  updateScenario({
                    monthlyRevenueAtRisk: Number(event.target.value),
                  })
                }
                className="mt-3 w-full accent-[var(--brand-lime-deep)]"
              />
            </label>

            <label className="block">
              <div className="flex items-center justify-between text-sm font-medium text-[var(--ink)]">
                <span>Delay exposure</span>
                <span>{scenarioInput.delayWeeks} weeks</span>
              </div>
              <input
                type="range"
                min="2"
                max="26"
                value={scenarioInput.delayWeeks}
                onChange={(event) =>
                  updateScenario({ delayWeeks: Number(event.target.value) })
                }
                className="mt-3 w-full accent-[var(--brand-lime-deep)]"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={() => void runSimulation(scenarioInput)}
            className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
            disabled={isScenarioPending}
          >
            {isScenarioPending ? "Running scenario..." : "Run live scenario"}
          </button>
        </div>

        <div className="rounded-[36px] border border-white/50 bg-[rgba(10,18,12,0.88)] p-6 shadow-[0_32px_110px_rgba(6,10,8,0.24)] md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-white/45">
                {simulation.audience}
              </div>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">
                {simulation.name}
              </h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs uppercase tracking-[0.26em] text-lime-200">
              {simulation.system}
            </div>
          </div>

          <p className="mt-5 max-w-3xl text-base leading-7 text-white/72">
            {simulation.narrative}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {simulation.metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5"
              >
                <div className="text-xs uppercase tracking-[0.24em] text-white/42">
                  {metric.label}
                </div>
                <div className="mt-3 text-3xl font-semibold text-white">
                  {metric.value}
                </div>
                <p className="mt-2 text-sm leading-6 text-white/62">{metric.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[0.86fr_1.14fr]">
            <div className="rounded-[28px] border border-white/10 bg-black/14 p-5">
              <div className="text-xs uppercase tracking-[0.28em] text-white/45">
                Proof Stack
              </div>
              <div className="mt-4 space-y-3">
                {simulation.proofPoints.map((point) => (
                  <div
                    key={point}
                    className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white/72"
                  >
                    {point}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#0d120f] p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="text-xs uppercase tracking-[0.28em] text-white/45">
                  Copy-Paste Narrative
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-full border border-white/14 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition-colors hover:border-white/30 hover:text-white"
                >
                  {copyState}
                </button>
              </div>
              <textarea
                readOnly
                value={simulation.copyBlock}
                className="mt-4 min-h-[250px] w-full resize-none rounded-[22px] border border-white/10 bg-white/[0.03] p-4 font-mono text-sm leading-6 text-white/82 outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        id="stack"
        className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-10 sm:px-8 lg:grid-cols-3 lg:px-10"
      >
        <div className="rounded-[30px] border border-black/8 bg-white/70 p-6">
          <div className="text-xs uppercase tracking-[0.28em] text-[var(--ink-soft)]">
            Frontend surface
          </div>
          <h3 className="mt-3 text-2xl font-semibold text-[var(--ink)]">
            Premium operator UI instead of static persuasion blocks.
          </h3>
          <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
            The page is now a product shell with live controls, calculated outputs,
            and buyer-ready copy inside the experience.
          </p>
        </div>
        <div className="rounded-[30px] border border-black/8 bg-[var(--ink)] p-6">
          <div className="text-xs uppercase tracking-[0.28em] text-white/42">
            Backend logic
          </div>
          <h3 className="mt-3 text-2xl font-semibold text-white">
            Route handlers simulate the commercial case in real time.
          </h3>
          <p className="mt-4 text-sm leading-7 text-white/66">
            `GET /api/scenario-demo` returns quantified upside. `POST /api/demo-request`
            captures the commercial follow-up and persists when credentials are present.
          </p>
        </div>
        <div className="rounded-[30px] border border-black/8 bg-[var(--brand-lime)]/18 p-6">
          <div className="text-xs uppercase tracking-[0.28em] text-[var(--ink-soft)]">
            Sales utility
          </div>
          <h3 className="mt-3 text-2xl font-semibold text-[var(--ink)]">
            Simulated real-world buyer pressure, not abstract positioning.
          </h3>
          <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
            Each scenario frames Backaim as an operating decision with time, margin,
            and revenue consequences.
          </p>
        </div>
      </section>

      <section
        id="live-build"
        className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:px-10"
      >
        <div className="rounded-[34px] border border-white/10 bg-[var(--ink)] p-6 md:p-8">
          <div className="text-xs uppercase tracking-[0.3em] text-white/42">
            Live Build Request
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
            Turn this scenario into a stakeholder-ready operator plan.
          </h2>
          <p className="mt-4 text-base leading-7 text-white/68">
            Submit the buyer context and we will hand the backend a real commercial
            lead instead of a dead-end contact form.
          </p>

          <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
            <div className="text-xs uppercase tracking-[0.28em] text-white/40">
              Selected scenario
            </div>
            <div className="mt-2 text-2xl font-semibold text-white">
              {metricLabel(scenarioInput.scenarioId)}
            </div>
            <p className="mt-3 text-sm leading-6 text-white/66">
              Current model: {scenarioInput.facilities} facilities, $
              {scenarioInput.monthlyRevenueAtRisk.toLocaleString("en-US")} monthly
              value at risk, {scenarioInput.delayWeeks} weeks of delay exposure.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleLeadSubmit}
          className="rounded-[34px] border border-black/8 bg-white/82 p-6 shadow-[0_20px_80px_rgba(16,24,20,0.08)] backdrop-blur md:p-8"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-[var(--ink)]">Name</span>
              <input
                type="text"
                value={leadState.name}
                onChange={(event) =>
                  setLeadState((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-[var(--ink)] outline-none transition-colors focus:border-black/24"
                required
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-[var(--ink)]">Work email</span>
              <input
                type="email"
                value={leadState.workEmail}
                onChange={(event) =>
                  setLeadState((current) => ({
                    ...current,
                    workEmail: event.target.value,
                  }))
                }
                className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-[var(--ink)] outline-none transition-colors focus:border-black/24"
                required
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-[var(--ink)]">Company</span>
              <input
                type="text"
                value={leadState.company}
                onChange={(event) =>
                  setLeadState((current) => ({
                    ...current,
                    company: event.target.value,
                  }))
                }
                className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-[var(--ink)] outline-none transition-colors focus:border-black/24"
                required
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-[var(--ink)]">Timeline</span>
              <select
                value={leadState.timeline}
                onChange={(event) =>
                  setLeadState((current) => ({
                    ...current,
                    timeline: event.target.value,
                  }))
                }
                className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-[var(--ink)] outline-none transition-colors focus:border-black/24"
              >
                <option>Within 30 days</option>
                <option>This quarter</option>
                <option>Next two quarters</option>
                <option>Exploring for later</option>
              </select>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLeadPending}
            className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[var(--ink)] px-7 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
          >
            {isLeadPending ? "Submitting..." : "Request live build"}
          </button>

          {leadError ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {leadError}
            </div>
          ) : null}

          {leadSuccess ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {leadSuccess}
            </div>
          ) : null}
        </form>
      </section>
    </main>
  );
}
