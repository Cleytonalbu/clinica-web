export type AbaSupportLevel =
  | ""
  | "APOIO_TOTAL"
  | "APOIO_PARCIAL"
  | "INDEPENDENCIA";

export type AbaProgramsExecution =
  | ""
  | "TOTALMENTE_REALIZADOS"
  | "PARCIALMENTE_REALIZADOS"
  | "NAO_REALIZADOS";

export interface AbaProgramEvolutionData {
  index: number;
  program: string;
  response: AbaSupportLevel;
}

export interface AbaEvolutionData {
  conditionEntry: string;
  programs: AbaProgramEvolutionData[];
  programsExecution: AbaProgramsExecution;
  additionalObservations: string;
  conclusion: string;
}

export function createDefaultAbaEvolutionData():
  AbaEvolutionData {
  return {
    conditionEntry: "",
    programs: Array.from(
      {
        length: 9,
      },
      (
        _,
        index
      ) => ({
        index:
          index + 1,
        program: "",
        response: "",
      })
    ),
    programsExecution: "",
    additionalObservations: "",
    conclusion: "",
  };
}
