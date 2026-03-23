import Section from "./Section";
import SectionHeader from "./SectionHeader";

const team = [
  {
    title: "Founder / CEO",
    description:
      "Leads strategy, partnerships, and the operator licensing framework that scales Backaim’s modular deployments.",
  },
  {
    title: "Engineering",
    description:
      "Designs modular micro server farms and integrates them with controlled-environment agriculture systems for predictable performance.",
  },
  {
    title: "Operations",
    description:
      "Runs regional pilots, oversees onboarding and training, and ensures consistent deployment quality from onboarding through rollout.",
  },
];

export default function Team() {
  return (
    <Section>
      <SectionHeader title="TEAM" />
      <div className="grid gap-4 sm:grid-cols-3">
        {team.map((t) => (
          <div
            key={t.title}
            className="rounded-2xl border border-zinc-200/70 bg-white/70 p-6 shadow-sm"
          >
            <h3 className="text-base font-semibold text-zinc-900">
              {t.title}
            </h3>
            <p className="mt-3 text-zinc-700 leading-7">{t.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

