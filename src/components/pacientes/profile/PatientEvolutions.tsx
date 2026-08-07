import {
  EvolutionHeader,
  EvolutionStats,
  EvolutionTimeline,
} from "./evolutions";

export function PatientEvolutions() {
  return (
    <div className="space-y-6">
      <EvolutionHeader />

      <EvolutionStats />

      <EvolutionTimeline />
    </div>
  );
}