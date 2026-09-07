/* =========================================
   RESPONSÁVEL ↔ PACIENTE
   Clínica Integrada Entre Afetos

   Regra:
   - Um responsável pode ter vários pacientes.
   - Um paciente pode ter vários responsáveis.
   - Não altera o cadastro existente do paciente.
   - Estrutura preparada para futura API.
========================================= */

export type ResponsibleRelationship =
  | "Mãe"
  | "Pai"
  | "Avó"
  | "Avô"
  | "Tia"
  | "Tio"
  | "Irmã"
  | "Irmão"
  | "Responsável legal"
  | "Outro";

export interface StoredResponsible {
  id: number;

  nome: string;
  cpf: string;
  telefone: string;
  email: string;

  ativo: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface ResponsiblePatientLink {
  id: number;

  responsibleId: number;
  patientId: number;

  parentesco: ResponsibleRelationship;

  responsavelPrincipal: boolean;

  acessoApp: boolean;

  acessoFinanceiro: boolean;

  acessoDocumentos: boolean;

  ativo: boolean;

  createdAt: string;
  updatedAt: string;
}

const RESPONSIBLES_STORAGE_KEY =
  "entre-afetos-responsibles";

const RESPONSIBLE_PATIENT_LINKS_STORAGE_KEY =
  "entre-afetos-responsible-patient-links";

/* =========================================
   UTILITÁRIOS
========================================= */

function nowIso() {
  return new Date().toISOString();
}

function normalizeText(
  value?: string | null
) {
  return (
    value
      ?.trim()
      .toLocaleLowerCase(
        "pt-BR"
      ) ?? ""
  );
}

function normalizeCpf(
  value?: string | null
) {
  return (
    value?.replace(
      /\D/g,
      ""
    ) ?? ""
  );
}

/* =========================================
   RESPONSÁVEIS
========================================= */

export function getResponsibles(): StoredResponsible[] {
  try {
    const stored =
      localStorage.getItem(
        RESPONSIBLES_STORAGE_KEY
      );

    if (!stored) {
      return [];
    }

    const parsed =
      JSON.parse(stored);

    if (
      !Array.isArray(parsed)
    ) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

function persistResponsibles(
  responsibles: StoredResponsible[]
) {
  localStorage.setItem(
    RESPONSIBLES_STORAGE_KEY,
    JSON.stringify(
      responsibles
    )
  );
}

export function getResponsibleById(
  responsibleId: number
) {
  return (
    getResponsibles().find(
      (responsible) =>
        responsible.id ===
        responsibleId
    ) ?? null
  );
}

export function findResponsibleByCpf(
  cpf: string
) {
  const normalizedCpf =
    normalizeCpf(cpf);

  if (!normalizedCpf) {
    return null;
  }

  return (
    getResponsibles().find(
      (responsible) =>
        normalizeCpf(
          responsible.cpf
        ) ===
        normalizedCpf
    ) ?? null
  );
}

export function findResponsibleByEmail(
  email: string
) {
  const normalizedEmail =
    normalizeText(email);

  if (!normalizedEmail) {
    return null;
  }

  return (
    getResponsibles().find(
      (responsible) =>
        normalizeText(
          responsible.email
        ) ===
        normalizedEmail
    ) ?? null
  );
}

export function findResponsible(
  data: {
    cpf?: string;
    email?: string;
    nome?: string;
  }
) {
  const cpf =
    normalizeCpf(data.cpf);

  const email =
    normalizeText(
      data.email
    );

  const nome =
    normalizeText(
      data.nome
    );

  return (
    getResponsibles().find(
      (responsible) => {
        if (
          cpf &&
          normalizeCpf(
            responsible.cpf
          ) === cpf
        ) {
          return true;
        }

        if (
          email &&
          normalizeText(
            responsible.email
          ) === email
        ) {
          return true;
        }

        if (
          nome &&
          normalizeText(
            responsible.nome
          ) === nome
        ) {
          return true;
        }

        return false;
      }
    ) ?? null
  );
}

export function saveResponsible(
  input: Omit<
    StoredResponsible,
    | "id"
    | "createdAt"
    | "updatedAt"
  > & {
    id?: number;
  }
): StoredResponsible {
  const responsibles =
    getResponsibles();

  const existing =
    input.id
      ? responsibles.find(
          (item) =>
            item.id ===
            input.id
        )
      : findResponsible({
          cpf: input.cpf,
          email: input.email,
          nome: input.nome,
        });

  if (existing) {
    const updated: StoredResponsible =
      {
        ...existing,
        ...input,

        id: existing.id,

        updatedAt:
          nowIso(),
      };

    persistResponsibles(
      responsibles.map(
        (item) =>
          item.id ===
          existing.id
            ? updated
            : item
      )
    );

    return updated;
  }

  const nextId =
    responsibles.length
      ? Math.max(
          ...responsibles.map(
            (item) =>
              item.id
          )
        ) + 1
      : 1;

  const responsible: StoredResponsible =
    {
      id: nextId,

      nome:
        input.nome.trim(),

      cpf:
        input.cpf ?? "",

      telefone:
        input.telefone ?? "",

      email:
        input.email ?? "",

      ativo:
        input.ativo ??
        true,

      createdAt:
        nowIso(),

      updatedAt:
        nowIso(),
    };

  persistResponsibles([
    ...responsibles,
    responsible,
  ]);

  return responsible;
}

export function updateResponsible(
  responsibleId: number,
  changes: Partial<
    Omit<
      StoredResponsible,
      "id" | "createdAt"
    >
  >
) {
  const responsible =
    getResponsibleById(
      responsibleId
    );

  if (!responsible) {
    return null;
  }

  return saveResponsible({
    ...responsible,
    ...changes,

    id: responsible.id,
  });
}

/* =========================================
   VÍNCULOS
========================================= */

export function getResponsiblePatientLinks(): ResponsiblePatientLink[] {
  try {
    const stored =
      localStorage.getItem(
        RESPONSIBLE_PATIENT_LINKS_STORAGE_KEY
      );

    if (!stored) {
      return [];
    }

    const parsed =
      JSON.parse(stored);

    if (
      !Array.isArray(parsed)
    ) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

function persistResponsiblePatientLinks(
  links: ResponsiblePatientLink[]
) {
  localStorage.setItem(
    RESPONSIBLE_PATIENT_LINKS_STORAGE_KEY,
    JSON.stringify(
      links
    )
  );
}

/* =========================================
   BUSCAR VÍNCULOS DO PACIENTE
========================================= */

export function getPatientResponsibleLinks(
  patientId: number
) {
  return getResponsiblePatientLinks()
    .filter(
      (link) =>
        link.patientId ===
          patientId &&
        link.ativo
    )
    .sort(
      (a, b) =>
        Number(
          b.responsavelPrincipal
        ) -
        Number(
          a.responsavelPrincipal
        )
    );
}

export function getPatientResponsibles(
  patientId: number
) {
  return getPatientResponsibleLinks(
    patientId
  )
    .map((link) => {
      const responsible =
        getResponsibleById(
          link.responsibleId
        );

      if (!responsible) {
        return null;
      }

      return {
        ...responsible,
        link,
      };
    })
    .filter(
      (
        item
      ): item is StoredResponsible & {
        link: ResponsiblePatientLink;
      } => Boolean(item)
    );
}

/* =========================================
   BUSCAR PACIENTES DO RESPONSÁVEL
========================================= */

export function getResponsiblePatientIds(
  responsibleId: number
) {
  return getResponsiblePatientLinks()
    .filter(
      (link) =>
        link.responsibleId ===
          responsibleId &&
        link.ativo
    )
    .map(
      (link) =>
        link.patientId
    );
}

/* =========================================
   CRIAR / ATUALIZAR VÍNCULO
========================================= */

export function linkResponsibleToPatient(
  input: {
    responsibleId: number;
    patientId: number;

    parentesco?: ResponsibleRelationship;

    responsavelPrincipal?: boolean;

    acessoApp?: boolean;

    acessoFinanceiro?: boolean;

    acessoDocumentos?: boolean;

    ativo?: boolean;
  }
): ResponsiblePatientLink {
  let links =
    getResponsiblePatientLinks();

  const existing =
    links.find(
      (link) =>
        link.responsibleId ===
          input.responsibleId &&
        link.patientId ===
          input.patientId
    );

  /*
   * Se este responsável passar
   * a ser o principal, retiramos
   * o status principal dos demais
   * responsáveis do mesmo paciente.
   */
  if (
    input.responsavelPrincipal
  ) {
    links =
      links.map(
        (link) =>
          link.patientId ===
          input.patientId
            ? {
                ...link,
                responsavelPrincipal:
                  false,

                updatedAt:
                  nowIso(),
              }
            : link
      );
  }

  if (existing) {
    const updated: ResponsiblePatientLink =
      {
        ...existing,

        parentesco:
          input.parentesco ??
          existing.parentesco,

        responsavelPrincipal:
          input.responsavelPrincipal ??
          existing.responsavelPrincipal,

        acessoApp:
          input.acessoApp ??
          existing.acessoApp,

        acessoFinanceiro:
          input.acessoFinanceiro ??
          existing.acessoFinanceiro,

        acessoDocumentos:
          input.acessoDocumentos ??
          existing.acessoDocumentos,

        ativo:
          input.ativo ??
          true,

        updatedAt:
          nowIso(),
      };

    persistResponsiblePatientLinks(
      links.map(
        (link) =>
          link.id ===
          existing.id
            ? updated
            : link
      )
    );

    return updated;
  }

  const nextId =
    links.length
      ? Math.max(
          ...links.map(
            (link) =>
              link.id
          )
        ) + 1
      : 1;

  const newLink: ResponsiblePatientLink =
    {
      id: nextId,

      responsibleId:
        input.responsibleId,

      patientId:
        input.patientId,

      parentesco:
        input.parentesco ??
        "Responsável legal",

      responsavelPrincipal:
        input.responsavelPrincipal ??
        false,

      acessoApp:
        input.acessoApp ??
        true,

      acessoFinanceiro:
        input.acessoFinanceiro ??
        true,

      acessoDocumentos:
        input.acessoDocumentos ??
        true,

      ativo:
        input.ativo ??
        true,

      createdAt:
        nowIso(),

      updatedAt:
        nowIso(),
    };

  persistResponsiblePatientLinks([
    ...links,
    newLink,
  ]);

  return newLink;
}

/* =========================================
   DESVINCULAR
========================================= */

export function unlinkResponsibleFromPatient(
  responsibleId: number,
  patientId: number
) {
  const links =
    getResponsiblePatientLinks();

  const link =
    links.find(
      (item) =>
        item.responsibleId ===
          responsibleId &&
        item.patientId ===
          patientId
    );

  if (!link) {
    return false;
  }

  persistResponsiblePatientLinks(
    links.map(
      (item) =>
        item.id ===
        link.id
          ? {
              ...item,

              ativo: false,

              responsavelPrincipal:
                false,

              updatedAt:
                nowIso(),
            }
          : item
    )
  );

  return true;
}

/* =========================================
   DEFINIR RESPONSÁVEL PRINCIPAL
========================================= */

export function setPrimaryResponsible(
  responsibleId: number,
  patientId: number
) {
  const links =
    getResponsiblePatientLinks();

  const target =
    links.find(
      (link) =>
        link.responsibleId ===
          responsibleId &&
        link.patientId ===
          patientId &&
        link.ativo
    );

  if (!target) {
    return false;
  }

  persistResponsiblePatientLinks(
    links.map(
      (link) => {
        if (
          link.patientId !==
          patientId
        ) {
          return link;
        }

        return {
          ...link,

          responsavelPrincipal:
            link.responsibleId ===
            responsibleId,

          updatedAt:
            nowIso(),
        };
      }
    )
  );

  return true;
}

/* =========================================
   RESPONSÁVEL PRINCIPAL
========================================= */

export function getPrimaryResponsible(
  patientId: number
) {
  const link =
    getPatientResponsibleLinks(
      patientId
    ).find(
      (item) =>
        item.responsavelPrincipal
    );

  if (!link) {
    return null;
  }

  const responsible =
    getResponsibleById(
      link.responsibleId
    );

  if (!responsible) {
    return null;
  }

  return {
    ...responsible,
    link,
  };
}

/* =========================================
   PACIENTES LIBERADOS PARA O APP
========================================= */

export function getResponsibleAppPatientIds(
  responsibleId: number
) {
  return getResponsiblePatientLinks()
    .filter(
      (link) =>
        link.responsibleId ===
          responsibleId &&
        link.ativo &&
        link.acessoApp
    )
    .map(
      (link) =>
        link.patientId
    );
}