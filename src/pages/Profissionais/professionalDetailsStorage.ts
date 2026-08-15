export interface ProfessionalDetails {
  professionalId: number;

  birthDate: string;
  cpf: string;
  rg: string;

  phone: string;
  email: string;

  councilType: string;
  councilNumber: string;

  employmentType: string;
  admissionDate: string;

  status:
    | "Ativo"
    | "Inativo"
    | "Férias";

  observations: string;

  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY =
  "entre-afetos-professional-details";

export function getProfessionalDetails():
  ProfessionalDetails[] {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (
      !raw
    ) {
      return [];
    }

    const parsed =
      JSON.parse(
        raw
      );

    if (
      !Array.isArray(
        parsed
      )
    ) {
      return [];
    }

    return parsed.filter(
      (
        item
      ) =>
        item &&
        typeof item ===
          "object" &&
        Number.isFinite(
          Number(
            item.professionalId
          )
        )
    );
  } catch {
    return [];
  }
}

export function getProfessionalDetailsById(
  professionalId: number
) {
  return getProfessionalDetails().find(
    (
      item
    ) =>
      item.professionalId ===
      professionalId
  );
}

export function saveProfessionalDetails(
  details:
    ProfessionalDetails
) {
  const current =
    getProfessionalDetails();

  const exists =
    current.some(
      (
        item
      ) =>
        item.professionalId ===
        details.professionalId
    );

  const next =
    exists
      ? current.map(
          (
            item
          ) =>
            item.professionalId ===
            details.professionalId
              ? details
              : item
        )
      : [
          ...current,
          details,
        ];

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      next
    )
  );
}