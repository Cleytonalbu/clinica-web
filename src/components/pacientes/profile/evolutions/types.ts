export interface Evolution {
  id: number;

  specialty: string;

  professional: string;

  objective: string;

  sessionDate: string;

  createdAt: string;

  description: string;

  patientResponse: string;

  familyGuidance: string;

  attachments: number;

  status:
    | "Registrada"
    | "Revisada";
}