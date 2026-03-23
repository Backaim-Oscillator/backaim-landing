import Hero from "@/components/landing/Hero";
import Problem from "@/components/landing/Problem";
import Solution from "@/components/landing/Solution";
import RevenueModel from "@/components/landing/RevenueModel";
import Roadmap from "@/components/landing/Roadmap";
import Team from "@/components/landing/Team";
import PilotLocations from "@/components/landing/PilotLocations";
import OperatorApplicationForm from "@/components/landing/OperatorApplicationForm";
import Disclaimer from "@/components/landing/Disclaimer";

export default function Page() {
  return (
    <main>
      <Hero />
      <Problem />
      <Solution />
      <RevenueModel />
      <Roadmap />
      <Team />
      <PilotLocations />
      <OperatorApplicationForm />
      <Disclaimer />
    </main>
  );
}
