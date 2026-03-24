"use client";

import Image from "next/image";
import { type FormEvent, useEffect, useState, useTransition } from "react";
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

const productVisuals = [
  {
    title: "HAS. Dirty Pictures",
    description: "Signals between leads, accounts, and conversion pressure.",
    src: "/images/mvp/sales-activity.svg",
  },
  {
    title: "Marketing Intelligence",
    description: "Channels converge into a measurable conversion system.",
    src: "/images/mvp/marketing-flow.svg",
  },
  {
    title: "Legal + Accounting",
    description: "Structured data relationships with stable decision paths.",
    src: "/images/mvp/legal-grid.svg",
  },
  {
    title: "Speakang",
    description: "Conversational flow rendered as intelligence in motion.",
    src: "/images/mvp/language-wave.svg",
  },
];

const navItems = [
  { id: "studio", label: "Scenario Studio" },
  { id: "how-it-works", label: "How It Works" },
  { id: "products", label: "Products" },
  { id: "stack", label: "Operator Stack" },
  { id: "live-build", label: "Live Build" },
];

function metricLabel(id: string) {
  return scenarioCatalog.find((scenario) => scenario.id === id)?.name ?? id;
}

export default function MvpExperience() {
  const [activeSection, setActiveSection] = useState(navItems[0].id);
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

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => section !== null);

    if (!sections.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const nextSection = visibleEntries[0]?.target.getAttribute("id");
        if (nextSection) {
          setActiveSection(nextSection);
        }
      },
      {
        rootMargin: "-25% 0px -55% 0px",
        threshold: [0.2, 0.35, 0.5, 0.7],
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  function handleNavClick(sectionId: string) {
    const target = document.getElementById(sectionId);
    if (!target) {
      return;
    }

    setActiveSection(sectionId);
    window.history.replaceState(null, "", `#${sectionId}`);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

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
      <div className="absolute inset-x-0 top-0 -z-20 h-[760px] bg-[radial-gradient(circle_at_top_left,_rgba(168,255,120,0.16),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_28%),linear-gradient(180deg,_#07100d_0%,_#0b1410_48%,_#f5f1e8_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(180deg,black,transparent_82%)]" />

      <section className="mx-auto flex w-full max-w-7xl flex-col px-5 pb-12 pt-6 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-4 text-sm text-white/72 md:flex-row md:items-center md:justify-between">
          <div className="font-medium tracking-[0.28em] text-white">BACKAIM OS</div>
          <nav className="-mx-1 flex gap-2 overflow-x-auto pb-1 md:mx-0 md:gap-6 md:overflow-visible md:pb-0">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={activeSection === item.id ? "page" : undefined}
                className={`shrink-0 rounded-full border px-3 py-2 text-xs font-medium transition-colors md:border-0 md:bg-transparent md:px-0 md:py-0 md:text-sm ${
                  activeSection === item.id
                    ? "border-lime-300/35 bg-lime-200/12 text-white md:text-lime-100"
                    : "border-white/10 bg-white/[0.04] text-white/84 hover:border-white/24 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="relative grid gap-10 py-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-end lg:py-[4.5rem]">
          <div className="pointer-events-none absolute inset-x-0 top-8 -z-10 hidden h-[520px] opacity-55 lg:block">
            <Image
              src="/images/mvp/hero-network.svg"
              alt=""
              fill
              className="object-contain object-center"
              aria-hidden="true"
              priority
            />
          </div>

          <div className="relative max-w-4xl">
            <div className="inline-flex rounded-full border border-lime-300/25 bg-lime-200/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-lime-100">
              Full-stack MVP with product-grade visuals
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.94] tracking-[-0.04em] text-white sm:text-7xl">
              Simulate the sale, quantify the edge, and show the system as intelligence in motion.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
              The page now uses abstract premium visuals instead of generic imagery:
              network intelligence at the top, system-flow explanation in the middle,
              product-specific graphics in the grid, and a stronger close.
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
                  Hero Visual
                </div>
                <div className="mt-2 text-3xl font-semibold text-white">Updated</div>
                <p className="mt-2 text-sm leading-6 text-white/64">
                  The top section now uses an abstract connected-system image behind the headline.
                </p>
              </div>
              <div className="glass-panel rounded-[28px] p-5">
                <div className="text-xs uppercase tracking-[0.26em] text-white/42">
                  System Flow
                </div>
                <div className="mt-2 text-3xl font-semibold text-white">3-step</div>
                <p className="mt-2 text-sm leading-6 text-white/64">
                  Added a dedicated diagram illustration for data, AI processing, and action.
                </p>
              </div>
              <div className="glass-panel rounded-[28px] p-5">
                <div className="text-xs uppercase tracking-[0.26em] text-white/42">
                  Product Imagery
                </div>
                <div className="mt-2 text-3xl font-semibold text-white">4 visuals</div>
                <p className="mt-2 text-sm leading-6 text-white/64">
                  Each product area now has a distinct abstract image instead of reused screenshots.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[34px] bg-lime-200/14 blur-3xl" />
            <div className="relative overflow-hidden rounded-[34px] border border-white/12 bg-[#101915]/80 p-4 shadow-[0_32px_100px_rgba(3,8,6,0.45)] backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between rounded-[24px] border border-white/10 bg-black/18 px-4 py-3 text-xs uppercase tracking-[0.24em] text-white/48">
                <span>Interconnected business systems</span>
                <span>{simulation.urgencyLabel}</span>
              </div>
              <Image
                src="/images/mvp/hero-network.svg"
                alt="Abstract futuristic network visualization representing interconnected business systems."
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
            The interaction stays product-first: select a pressure pattern, adjust the
            economic inputs, and return a quantified operating case with reusable sales copy.
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
        id="how-it-works"
        className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:px-10"
      >
        <div className="rounded-[34px] border border-black/8 bg-white/74 p-6 md:p-8">
          <div className="text-xs uppercase tracking-[0.32em] text-[var(--ink-soft)]">
            How It Works
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--ink)]">
            Input signals, process them centrally, then trigger actions.
          </h2>
          <p className="mt-4 text-base leading-7 text-[var(--ink-soft)]">
            The explanation now has its own structured illustration instead of asking
            the UI copy to do all the work. That keeps the page clearer and more credible.
          </p>
          <div className="mt-8 space-y-3">
            <div className="rounded-[20px] border border-black/8 bg-black/[0.02] px-4 py-4 text-sm leading-6 text-[var(--ink)]">
              1. Inputs: emails, calls, interactions, and commercial pressure points.
            </div>
            <div className="rounded-[20px] border border-black/8 bg-black/[0.02] px-4 py-4 text-sm leading-6 text-[var(--ink)]">
              2. Core: scenario logic and operating intelligence convert noise into structure.
            </div>
            <div className="rounded-[20px] border border-black/8 bg-black/[0.02] px-4 py-4 text-sm leading-6 text-[var(--ink)]">
              3. Outputs: messages, decisions, deployment priorities, and optimizations.
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[34px] border border-black/8 bg-white/72 p-4 shadow-[0_24px_90px_rgba(15,23,20,0.08)]">
          <Image
            src="/images/mvp/how-it-works-flow.svg"
            alt="Abstract three-step system flow showing data inputs, central AI processing, and output actions."
            width={1400}
            height={900}
            className="w-full rounded-[28px] border border-black/6"
          />
        </div>
      </section>

      <section
        id="products"
        className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10"
      >
        <div className="flex max-w-3xl flex-col gap-3">
          <div className="text-xs uppercase tracking-[0.32em] text-[var(--ink-soft)]">
            Product Visuals
          </div>
          <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[var(--ink)]">
            Each product area now has imagery that feels specific and intentional.
          </h2>
          <p className="text-base leading-7 text-[var(--ink-soft)]">
            The grid uses distinct abstract visuals for sales, marketing, legal-accounting,
            and language AI so the products read like separate surfaces in one ecosystem.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {productVisuals.map((visual) => (
            <article
              key={visual.title}
              className="overflow-hidden rounded-[30px] border border-black/8 bg-white/74 shadow-[0_18px_60px_rgba(15,23,20,0.07)]"
            >
              <Image
                src={visual.src}
                alt={visual.title}
                width={900}
                height={680}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="p-5">
                <h3 className="text-xl font-semibold text-[var(--ink)]">{visual.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                  {visual.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="stack"
        className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10"
      >
        <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[var(--ink)] p-4 shadow-[0_28px_90px_rgba(10,18,12,0.16)]">
          <Image
            src="/images/mvp/operator-network.svg"
            alt="Abstract global operator network connected to a central intelligent system."
            width={1400}
            height={860}
            className="rounded-[28px] border border-white/10"
          />
          <div className="px-2 pb-2 pt-5">
            <div className="text-xs uppercase tracking-[0.28em] text-white/42">
              Operator Model
            </div>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              Distributed operators connected through one intelligent backbone.
            </h3>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="overflow-hidden rounded-[34px] border border-black/8 bg-white/74 p-4">
            <Image
              src="/images/mvp/infrastructure-mesh.svg"
              alt="Abstract physical infrastructure integrated with digital intelligence."
              width={1400}
              height={860}
              className="rounded-[28px] border border-black/6"
            />
            <div className="px-2 pb-2 pt-5">
              <div className="text-xs uppercase tracking-[0.28em] text-[var(--ink-soft)]">
                Infrastructure Layer
              </div>
              <h3 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                Digital intelligence tied directly to physical systems.
              </h3>
            </div>
          </div>

          <div className="overflow-hidden rounded-[34px] border border-black/8 bg-white/74 p-4">
            <Image
              src="/images/mvp/dashboard-mockup.svg"
              alt="Modern SaaS dashboard mockup for a sales intelligence system."
              width={1400}
              height={920}
              className="rounded-[28px] border border-black/6"
            />
            <div className="px-2 pb-2 pt-5">
              <div className="text-xs uppercase tracking-[0.28em] text-[var(--ink-soft)]">
                Product Reality
              </div>
              <h3 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                A dashboard visual that makes the system feel buyable.
              </h3>
            </div>
          </div>
        </div>
      </section>

      <section
        id="live-build"
        className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:px-10"
      >
        <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[var(--ink)] p-4 md:p-5">
          <Image
            src="/images/mvp/final-cta-glow.svg"
            alt="Minimal abstract scene representing forward momentum and future building."
            width={1400}
            height={860}
            className="rounded-[28px] border border-white/10"
          />
          <div className="px-2 pb-3 pt-5">
            <div className="text-xs uppercase tracking-[0.3em] text-white/42">
              Live Build Request
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
              Turn this scenario into a stakeholder-ready operator plan.
            </h2>
            <p className="mt-4 text-base leading-7 text-white/68">
              The close now carries a stronger emotional visual instead of ending on form fields alone.
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
