import Section from "./Section";
import SectionHeader from "./SectionHeader";

const items = [
  { when: "Q2 2025", text: "Pilot deployments in 3 regions" },
  { when: "Q3 2025", text: "Operator onboarding & training" },
  { when: "Q4 2025", text: "Full modular system rollout" },
  { when: "2026", text: "Expansion across Europe" },
];

export default function Roadmap() {
  return (
    <Section>
      <SectionHeader title="ROADMAP" />

      <ol className="relative space-y-6 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:items-stretch">
        {/* Vertical timeline line that adapts into a subtle connector grid */}
        <div className="pointer-events-none hidden sm:block absolute left-0 top-1 bottom-1 w-px bg-zinc-200/70" />

        {items.map((item, idx) => (
          <li key={item.when} className="sm:relative">
            <div className="flex gap-4 sm:flex-col sm:gap-3 h-full">
              <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white text-sm font-semibold">
                {idx + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold tracking-tight text-zinc-900">
                  {item.when}
                </p>
                <p className="mt-2 text-sm sm:text-base text-zinc-700 leading-6">
                  {item.text}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

