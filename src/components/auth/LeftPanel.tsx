import { HeroContent } from "./HeroContent";
import { HeroIllustration } from "./HeroIllustration";
import { HeroFeatures } from "./HeroFeatures";

export function LeftPanel() {
  return (
    <div className="max-w-2xl">

      <div className="mb-10 flex h-20 w-64 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-slate-400">
        Logo da Clínica
      </div>

      <HeroContent />

      <HeroIllustration />

      <HeroFeatures />

    </div>
  );
}