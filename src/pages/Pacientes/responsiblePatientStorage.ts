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

  const responsibles =
    getResponsibles();

  if (cpf) {
    const byCpf =
      responsibles.find(
        (responsible) =>
          normalizeCpf(
            responsible.cpf
          ) === cpf
      );

    if (byCpf) {
      return byCpf;
    }
  }

  if (email) {
    const byEmail =
      responsibles.find(
        (responsible) =>
          normalizeText(
            responsible.email
          ) === email
      );

    if (byEmail) {
      return byEmail;
    }
  }

  /*
   * Nome só é usado como identificação
   * quando CPF e e-mail não foram informados.
   * Isso evita unir duas pessoas diferentes
   * que tenham o mesmo nome.
   */
  if (
    nome &&
    !cpf &&
    !email
  ) {
    return (
      responsibles.find(
        (responsible) =>
          normalizeText(
            responsible.nome
          ) === nome
      ) ?? null
    );
  }

  return null;
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

/* =========================================
   DADOS DO FORMULÁRIO DE RESPONSÁVEL
========================================= */

export interface PatientResponsibleFormData {
  responsibleId?: number | null;

  nome: string;
  cpf: string;
  parentesco: string;
  telefone: string;
  email: string;

  responsavelPrincipal: boolean;

  acessoApp: boolean;
  acessoFinanceiro: boolean;
  acessoDocumentos: boolean;

  ativo: boolean;
}

function normalizeRelationship(
  value?: string | null
): ResponsibleRelationship {
  const allowed: ResponsibleRelationship[] = [
    "Mãe",
    "Pai",
    "Avó",
    "Avô",
    "Tia",
    "Tio",
    "Irmã",
    "Irmão",
    "Responsável legal",
    "Outro",
  ];

  if (
    value &&
    allowed.includes(
      value as ResponsibleRelationship
    )
  ) {
    return value as ResponsibleRelationship;
  }

  return "Responsável legal";
}

/* =========================================
   SINCRONIZAR RESPONSÁVEIS DO PACIENTE

   - cria novos responsáveis
   - atualiza responsáveis existentes
   - atualiza permissões e parentesco
   - mantém apenas um principal
   - desvincula os removidos deste paciente
   - não exclui o responsável de outros filhos
========================================= */

export function syncPatientResponsibles(
  patientId: number,
  formResponsibles: PatientResponsibleFormData[]
) {
  if (
    !Number.isFinite(patientId) ||
    patientId <= 0
  ) {
    throw new Error(
      "Paciente inválido para sincronização dos responsáveis."
    );
  }

  const validResponsibles =
    (formResponsibles ?? []).filter(
      (responsible) =>
        Boolean(
          responsible.nome?.trim()
        )
    );

  /*
   * Mantemos exatamente um responsável principal.
   * Se vierem vários marcados pelo formulário,
   * o primeiro marcado prevalece.
   * Se nenhum vier marcado, o primeiro válido
   * passa a ser o principal.
   */
  const primaryIndex =
    validResponsibles.findIndex(
      (responsible) =>
        responsible.responsavelPrincipal
    );

  const effectivePrimaryIndex =
    primaryIndex >= 0
      ? primaryIndex
      : validResponsibles.length > 0
        ? 0
        : -1;

  const normalized =
    validResponsibles.map(
      (responsible, index) => ({
        ...responsible,

        responsavelPrincipal:
          index === effectivePrimaryIndex,
      })
    );

  const previousLinks =
    getPatientResponsibleLinks(
      patientId
    );

  const keptResponsibleIds:
    number[] = [];

  normalized.forEach(
    (responsibleData) => {
      let responsible:
        StoredResponsible | null =
        null;

      if (
        responsibleData.responsibleId
      ) {
        const existingById =
          getResponsibleById(
            responsibleData.responsibleId
          );

        if (existingById) {
          responsible =
            saveResponsible({
              id: existingById.id,

              nome:
                responsibleData.nome,

              cpf:
                responsibleData.cpf ?? "",

              telefone:
                responsibleData.telefone ?? "",

              email:
                responsibleData.email ?? "",

              ativo:
                responsibleData.ativo ?? true,
            });
        }
      }

      if (!responsible) {
        const existing =
          findResponsible({
            cpf:
              responsibleData.cpf,

            email:
              responsibleData.email,

            nome:
              responsibleData.nome,
          });

        responsible =
          saveResponsible({
            id: existing?.id,

            nome:
              responsibleData.nome,

            cpf:
              responsibleData.cpf ?? "",

            telefone:
              responsibleData.telefone ?? "",

            email:
              responsibleData.email ?? "",

            ativo:
              responsibleData.ativo ?? true,
          });
      }

      keptResponsibleIds.push(
        responsible.id
      );

      linkResponsibleToPatient({
        responsibleId:
          responsible.id,

        patientId,

        parentesco:
          normalizeRelationship(
            responsibleData.parentesco
          ),

        responsavelPrincipal:
          responsibleData.responsavelPrincipal,

        acessoApp:
          responsibleData.acessoApp ?? true,

        acessoFinanceiro:
          responsibleData.acessoFinanceiro ?? true,

        acessoDocumentos:
          responsibleData.acessoDocumentos ?? true,

        ativo:
          responsibleData.ativo ?? true,
      });
    }
  );

  previousLinks.forEach(
    (previousLink) => {
      const stillExists =
        keptResponsibleIds.includes(
          previousLink.responsibleId
        );

      if (!stillExists) {
        unlinkResponsibleFromPatient(
          previousLink.responsibleId,
          patientId
        );
      }
    }
  );

  const finalLinks =
    getPatientResponsibleLinks(
      patientId
    );

  const finalPrimary =
    finalLinks.find(
      (link) =>
        link.responsavelPrincipal
    );

  if (
    !finalPrimary &&
    finalLinks.length > 0
  ) {
    setPrimaryResponsible(
      finalLinks[0].responsibleId,
      patientId
    );
  }

  return getPatientResponsibles(
    patientId
  );
}


/* =========================================
   MIGRAÇÃO DE PACIENTE ANTIGO

   Converte somente o responsável legado
   daquele paciente em um vínculo novo.

   - não duplica responsável por CPF/e-mail
   - não remove vínculos existentes
   - não altera irmãos já vinculados
   - pode ser chamada várias vezes com segurança
========================================= */

export interface LegacyPatientResponsibleData {
  id: number;
  responsavelNome?: string | null;
  responsavelCpf?: string | null;
  responsavelParentesco?: string | null;
  responsavelTelefone?: string | null;
  responsavelEmail?: string | null;
}

export function ensureLegacyPatientResponsibleLink(
  patient: LegacyPatientResponsibleData
) {
  if (
    !Number.isFinite(patient.id) ||
    patient.id <= 0
  ) {
    return null;
  }

  const nome =
    patient.responsavelNome?.trim() ?? "";

  if (!nome) {
    return null;
  }

  /*
   * Se o paciente já possui qualquer vínculo
   * ativo no novo modelo, não recriamos o legado.
   * Isso evita reativar alguém que tenha sido
   * removido manualmente depois da migração.
   */
  const existingPatientLinks =
    getPatientResponsibleLinks(patient.id);

  if (existingPatientLinks.length > 0) {
    return getPatientResponsibles(patient.id);
  }

  const existingResponsible =
    findResponsible({
      cpf: patient.responsavelCpf ?? "",
      email: patient.responsavelEmail ?? "",
      nome,
    });

  const responsible =
    saveResponsible({
      id: existingResponsible?.id,
      nome,
      cpf: patient.responsavelCpf ?? "",
      telefone:
        patient.responsavelTelefone ?? "",
      email: patient.responsavelEmail ?? "",
      ativo: true,
    });

  linkResponsibleToPatient({
    responsibleId: responsible.id,
    patientId: patient.id,
    parentesco: normalizeRelationship(
      patient.responsavelParentesco
    ),
    responsavelPrincipal: true,
    acessoApp: true,
    acessoFinanceiro: true,
    acessoDocumentos: true,
    ativo: true,
  });

  return getPatientResponsibles(patient.id);
}

export function ensureLegacyPatientResponsibleLinks(
  patients: LegacyPatientResponsibleData[]
) {
  (patients ?? []).forEach(
    (patient) => {
      ensureLegacyPatientResponsibleLink(
        patient
      );
    }
  );
}
