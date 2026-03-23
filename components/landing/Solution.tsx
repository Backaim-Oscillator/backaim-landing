import Section from "./Section";
import SectionHeader from "./SectionHeader";

export default function Solution() {
  return (
    <Section>
      <SectionHeader title="SOLUTION" />
      <div className="max-w-3xl">
        <p className="text-zinc-700 text-base sm:text-lg leading-8">
          Backaim builds modular micro server farms integrated with controlled‑environment
          agriculture. Each deployment co-locates compute with tightly managed growing
          environments, designed to convert energy and cooling needs into measurable
          operational value—so performance, reliability, and food output improve together.
        </p>
      </div>
    </Section>
  );
}

