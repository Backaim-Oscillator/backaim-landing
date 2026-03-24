export type ScenarioId =
  | "compute-burst"
  | "greenhouse-margin"
  | "grid-overflow";

export type ScenarioInput = {
  scenarioId: ScenarioId;
  facilities: number;
  monthlyRevenueAtRisk: number;
  delayWeeks: number;
};

export type ScenarioMetric = {
  label: string;
  value: string;
  detail: string;
};

export type ScenarioSimulation = {
  id: ScenarioId;
  name: string;
  audience: string;
  tagline: string;
  system: string;
  urgencyLabel: string;
  narrative: string;
  proofPoints: string[];
  metrics: ScenarioMetric[];
  copyBlock: string;
};

export type ScenarioTemplate = {
  id: ScenarioId;
  name: string;
  audience: string;
  tagline: string;
  system: string;
  urgencyLabel: string;
  proofPoints: string[];
  defaults: Omit<ScenarioInput, "scenarioId">;
};

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 0,
});

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export const scenarioCatalog: ScenarioTemplate[] = [
  {
    id: "compute-burst",
    name: "AI Compute Burst",
    audience: "Hyperscale and sovereign AI operators",
    tagline:
      "Demand spikes faster than grid approvals. Backaim compresses time-to-capacity.",
    system: "Modular GPU pod rollout + energy orchestration",
    urgencyLabel: "Capacity shortfall",
    proofPoints: [
      "Containerized deployment sequence",
      "Power-aware scheduling and load shaping",
      "Single commercial story for capacity plus energy",
    ],
    defaults: {
      facilities: 4,
      monthlyRevenueAtRisk: 950000,
      delayWeeks: 14,
    },
  },
  {
    id: "greenhouse-margin",
    name: "Greenhouse Margin Defense",
    audience: "Controlled-environment agriculture groups",
    tagline:
      "Energy volatility erodes yield economics. Backaim stabilizes margin with local intelligence.",
    system: "CEA operating layer + energy arbitrage controls",
    urgencyLabel: "Margin compression",
    proofPoints: [
      "Predictive load balancing against tariff windows",
      "Module-level visibility for yield and power",
      "Operator workflows built for mixed infrastructure fleets",
    ],
    defaults: {
      facilities: 7,
      monthlyRevenueAtRisk: 360000,
      delayWeeks: 10,
    },
  },
  {
    id: "grid-overflow",
    name: "Curtailment Recovery",
    audience: "Municipal utilities and renewable project owners",
    tagline:
      "Curtailment kills project economics. Backaim converts stranded power into contracted output.",
    system: "Distributed energy capture + on-site compute monetization",
    urgencyLabel: "Curtailment exposure",
    proofPoints: [
      "Behind-the-meter monetization path",
      "Rapid deployment without greenfield facility timelines",
      "Commercial packaging for utility, site owner, and off-taker",
    ],
    defaults: {
      facilities: 5,
      monthlyRevenueAtRisk: 520000,
      delayWeeks: 12,
    },
  },
];

export function getScenarioTemplate(id: ScenarioId) {
  return scenarioCatalog.find((scenario) => scenario.id === id) ?? scenarioCatalog[0];
}

export function getDefaultScenarioInput(): ScenarioInput {
  const scenario = scenarioCatalog[0];
  return { scenarioId: scenario.id, ...scenario.defaults };
}

export function parseScenarioInput(raw: Partial<Record<keyof ScenarioInput, string>>) {
  const template = getScenarioTemplate(
    (raw.scenarioId as ScenarioId | undefined) ?? getDefaultScenarioInput().scenarioId
  );

  const facilities = clamp(Number(raw.facilities) || template.defaults.facilities, 1, 20);
  const monthlyRevenueAtRisk = clamp(
    Number(raw.monthlyRevenueAtRisk) || template.defaults.monthlyRevenueAtRisk,
    50000,
    5000000
  );
  const delayWeeks = clamp(Number(raw.delayWeeks) || template.defaults.delayWeeks, 2, 26);

  return {
    scenarioId: template.id,
    facilities,
    monthlyRevenueAtRisk,
    delayWeeks,
  } satisfies ScenarioInput;
}

export function runScenarioSimulation(input: ScenarioInput): ScenarioSimulation {
  const template = getScenarioTemplate(input.scenarioId);
  const { facilities, monthlyRevenueAtRisk, delayWeeks } = input;

  let protectedRevenue = 0;
  let marginLift = 0;
  let deploymentGain = 0;
  let paybackMonths = 0;

  if (input.scenarioId === "compute-burst") {
    deploymentGain = Math.round(delayWeeks * 0.64);
    protectedRevenue =
      monthlyRevenueAtRisk * facilities * (0.72 + delayWeeks * 0.018);
    marginLift = clamp(0.11 + facilities * 0.009 + delayWeeks * 0.003, 0.12, 0.28);
    paybackMonths = clamp(14 - facilities - delayWeeks * 0.22, 5, 12);
  } else if (input.scenarioId === "greenhouse-margin") {
    deploymentGain = Math.round(delayWeeks * 0.48);
    protectedRevenue =
      monthlyRevenueAtRisk * facilities * (0.34 + delayWeeks * 0.014);
    marginLift = clamp(0.08 + facilities * 0.007 + delayWeeks * 0.0025, 0.09, 0.22);
    paybackMonths = clamp(16 - facilities * 0.7 - delayWeeks * 0.16, 6, 15);
  } else {
    deploymentGain = Math.round(delayWeeks * 0.56);
    protectedRevenue =
      monthlyRevenueAtRisk * facilities * (0.43 + delayWeeks * 0.016);
    marginLift = clamp(0.09 + facilities * 0.008 + delayWeeks * 0.0028, 0.1, 0.24);
    paybackMonths = clamp(15 - facilities * 0.8 - delayWeeks * 0.18, 6, 14);
  }

  const narrative =
    `${template.name} shows ${template.audience.toLowerCase()} how to collapse ` +
    `deployment drag into a packaged operating plan. With ${facilities} sites and ` +
    `${usd.format(monthlyRevenueAtRisk)} exposed each month, Backaim shifts the pitch ` +
    `from "future vision" to a quantified commercial move.`;

  const copyBlock = [
    `Subject: ${template.name} scenario for ${facilities} sites`,
    ``,
    `You currently have ${usd.format(monthlyRevenueAtRisk)} in monthly value exposed across ${facilities} sites while deployment friction adds roughly ${delayWeeks} weeks of delay.`,
    ``,
    `Backaim removes about ${deploymentGain} weeks from that path, protects ${usd.format(protectedRevenue)} in annualized value, and adds an estimated ${percent.format(marginLift)} margin improvement through ${template.system.toLowerCase()}.`,
    ``,
    `If useful, we can turn this into a live operator plan with deployment sequencing, commercial packaging, and a stakeholder-ready deck in one working session.`,
  ].join("\n");

  return {
    id: template.id,
    name: template.name,
    audience: template.audience,
    tagline: template.tagline,
    system: template.system,
    urgencyLabel: template.urgencyLabel,
    narrative,
    proofPoints: template.proofPoints,
    metrics: [
      {
        label: "Value Protected",
        value: usd.format(protectedRevenue),
        detail: "Annualized commercial value protected by faster activation.",
      },
      {
        label: "Weeks Recovered",
        value: `${deploymentGain} weeks`,
        detail: "Deployment time pulled forward through a modular rollout path.",
      },
      {
        label: "Margin Lift",
        value: percent.format(marginLift),
        detail: "Estimated operating margin gain after energy and utilization effects.",
      },
      {
        label: "Payback Window",
        value: `${paybackMonths.toFixed(0)} months`,
        detail: "Indicative payback period for the packaged Backaim stack.",
      },
    ],
    copyBlock,
  };
}
