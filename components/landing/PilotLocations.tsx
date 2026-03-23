import Section from "./Section";
import SectionHeader from "./SectionHeader";

const locations = [
  "Poland — Rzeszów",
  "Germany — NRW",
  "Spain — Valencia",
  "Estonia — Tallinn",
];

export default function PilotLocations() {
  return (
    <Section>
      <SectionHeader title="PILOT LOCATIONS" />
      <ul className="grid gap-3 sm:grid-cols-2">
        {locations.map((loc) => (
          <li
            key={loc}
            className="rounded-2xl border border-zinc-200/70 bg-white/70 px-5 py-4 shadow-sm"
          >
            <p className="text-base font-semibold text-zinc-900">{loc}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

