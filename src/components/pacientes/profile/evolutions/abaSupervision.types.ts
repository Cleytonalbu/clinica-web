export type AbaSupervisionAttendance =
  | ""
  | "SIM"
  | "NAO"
  | "JUSTIFICOU_AUSENCIA";

export type AbaSupervisionYesNo =
  | ""
  | "SIM"
  | "NAO";

export interface AbaSupervisionEvolutionData {
  conditionEntry: string;
  therapeuticCompanion: string;
  companionAttendance: AbaSupervisionAttendance;
  allProgramsApplied: AbaSupervisionYesNo;
  programNeedsModification: AbaSupervisionYesNo;
  hardestProgram: string;
  programEnded: AbaSupervisionYesNo;
  helpLevelEvolution: AbaSupervisionYesNo;
  additionalObservations: string;
  conclusion: string;
}

export function createDefaultAbaSupervisionEvolutionData():
  AbaSupervisionEvolutionData {
  return {
    conditionEntry: "",
    therapeuticCompanion: "",
    companionAttendance: "",
    allProgramsApplied: "",
    programNeedsModification: "",
    hardestProgram: "",
    programEnded: "",
    helpLevelEvolution: "",
    additionalObservations: "",
    conclusion: "",
  };
}
