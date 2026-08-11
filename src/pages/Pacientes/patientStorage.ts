import type {
  PatientSchema,
} from "@/components/pacientes/form";

/* =========================================
   TIPOS
========================================= */

export type PatientStatus =
  | "Ativo"
  | "Inativo";

export interface StoredPatient
  extends PatientSchema {
  id: number;

  status:
    PatientStatus;

  createdAt:
    string;

  updatedAt:
    string;
}

/* =========================================
   STORAGE
========================================= */

const STORAGE_KEY =
  "entre-afetos-patients";

/* =========================================
   PACIENTES DE DEMONSTRAÇÃO
========================================= */

const defaultPatients:
  StoredPatient[] = [
  {
    id: 1,

    nome:
      "Maria Oliveira",

    cpf:
      "123.456.789-10",

    rg:
      "",

    cns:
      "",

    nascimento:
      "2017-05-10",

    sexo:
      "Feminino",

    estadoCivil:
      "",

    telefone:
      "(83) 99999-9999",

    celular:
      "(83) 99999-9999",

    email:
      "",

    cep:
      "",

    rua:
      "",

    numero:
      "",

    bairro:
      "",

    cidade:
      "Guarabira",

    estado:
      "PB",

    complemento:
      "",

    convenio:
      "Particular",

    numeroCarteirinha:
      "",

    tipoSanguineo:
      "",

    alergias:
      "",

    responsavelNome:
      "Ana Oliveira",

    responsavelCpf:
      "",

    responsavelParentesco:
      "Mãe",

    responsavelTelefone:
      "(83) 99999-9999",

    responsavelEmail:
      "",

    observacoes:
      "",

    status:
      "Ativo",

    createdAt:
      "2026-07-01T10:00:00.000Z",

    updatedAt:
      "2026-07-01T10:00:00.000Z",
  },

  {
    id: 2,

    nome:
      "João Pedro",

    cpf:
      "987.654.321-11",

    rg:
      "",

    cns:
      "",

    nascimento:
      "2018-03-15",

    sexo:
      "Masculino",

    estadoCivil:
      "",

    telefone:
      "(83) 98888-8888",

    celular:
      "(83) 98888-8888",

    email:
      "",

    cep:
      "",

    rua:
      "",

    numero:
      "",

    bairro:
      "",

    cidade:
      "Guarabira",

    estado:
      "PB",

    complemento:
      "",

    convenio:
      "Unimed",

    numeroCarteirinha:
      "",

    tipoSanguineo:
      "",

    alergias:
      "",

    responsavelNome:
      "Carlos Pedro",

    responsavelCpf:
      "",

    responsavelParentesco:
      "Pai",

    responsavelTelefone:
      "(83) 98888-8888",

    responsavelEmail:
      "",

    observacoes:
      "",

    status:
      "Ativo",

    createdAt:
      "2026-07-02T10:00:00.000Z",

    updatedAt:
      "2026-07-02T10:00:00.000Z",
  },

  {
    id: 3,

    nome:
      "Fernanda Souza",

    cpf:
      "321.654.987-00",

    rg:
      "",

    cns:
      "",

    nascimento:
      "2016-11-20",

    sexo:
      "Feminino",

    estadoCivil:
      "",

    telefone:
      "(83) 97777-7777",

    celular:
      "(83) 97777-7777",

    email:
      "",

    cep:
      "",

    rua:
      "",

    numero:
      "",

    bairro:
      "",

    cidade:
      "Guarabira",

    estado:
      "PB",

    complemento:
      "",

    convenio:
      "Hapvida",

    numeroCarteirinha:
      "",

    tipoSanguineo:
      "",

    alergias:
      "",

    responsavelNome:
      "Patrícia Souza",

    responsavelCpf:
      "",

    responsavelParentesco:
      "Mãe",

    responsavelTelefone:
      "(83) 97777-7777",

    responsavelEmail:
      "",

    observacoes:
      "",

    status:
      "Inativo",

    createdAt:
      "2026-07-03T10:00:00.000Z",

    updatedAt:
      "2026-07-03T10:00:00.000Z",
  },
];

/* =========================================
   INICIALIZAR STORAGE
========================================= */

function initializeStorage() {
  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (stored) {
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,

      JSON.stringify(
        defaultPatients
      )
    );
  } catch {
    // Em caso de erro no localStorage,
    // apenas mantemos o fallback.
  }
}

/* =========================================
   LISTAR PACIENTES
========================================= */

export function getPatients():
  StoredPatient[] {
  try {
    initializeStorage();

    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      return [
        ...defaultPatients,
      ];
    }

    return JSON.parse(
      stored
    ) as StoredPatient[];
  } catch {
    return [
      ...defaultPatients,
    ];
  }
}

/* =========================================
   BUSCAR PACIENTE POR ID
========================================= */

export function getPatientById(
  patientId: number
) {
  return getPatients().find(
    (
      patient
    ) =>
      patient.id ===
      patientId
  );
}

/* =========================================
   BUSCAR PACIENTE POR CPF
========================================= */

export function getPatientByCpf(
  cpf: string
) {
  const normalizedCpf =
    normalizeDocument(
      cpf
    );

  return getPatients().find(
    (
      patient
    ) =>
      normalizeDocument(
        patient.cpf
      ) ===
      normalizedCpf
  );
}

/* =========================================
   CRIAR PACIENTE
========================================= */

export function createPatient(
  data: PatientSchema
) {
  const current =
    getPatients();

  const duplicatedCpf =
    getPatientByCpf(
      data.cpf
    );

  if (duplicatedCpf) {
    throw new Error(
      "Já existe um paciente cadastrado com este CPF."
    );
  }

  const now =
    new Date().toISOString();

  const patient:
    StoredPatient = {
    ...data,

    id:
      generatePatientId(
        current
      ),

    status:
      "Ativo",

    createdAt:
      now,

    updatedAt:
      now,
  };

  const next = [
    ...current,

    patient,
  ];

  savePatients(
    next
  );

  return patient;
}

/* =========================================
   ATUALIZAR PACIENTE
========================================= */

export function updatePatient(
  patientId: number,

  data:
    Partial<
      Omit<
        StoredPatient,
        | "id"
        | "createdAt"
      >
    >
) {
  const current =
    getPatients();

  const existing =
    current.find(
      (
        patient
      ) =>
        patient.id ===
        patientId
    );

  if (!existing) {
    throw new Error(
      "Paciente não encontrado."
    );
  }

  if (
    data.cpf &&
    normalizeDocument(
      data.cpf
    ) !==
      normalizeDocument(
        existing.cpf
      )
  ) {
    const duplicated =
      current.find(
        (
          patient
        ) =>
          patient.id !==
            patientId &&
          normalizeDocument(
            patient.cpf
          ) ===
            normalizeDocument(
              data.cpf!
            )
      );

    if (duplicated) {
      throw new Error(
        "Já existe outro paciente cadastrado com este CPF."
      );
    }
  }

  const next =
    current.map(
      (
        patient
      ) =>
        patient.id ===
        patientId
          ? {
              ...patient,

              ...data,

              updatedAt:
                new Date()
                  .toISOString(),
            }
          : patient
    );

  savePatients(
    next
  );

  return next.find(
    (
      patient
    ) =>
      patient.id ===
      patientId
  );
}

/* =========================================
   ALTERAR STATUS
========================================= */

export function setPatientStatus(
  patientId: number,

  status:
    PatientStatus
) {
  return updatePatient(
    patientId,

    {
      status,
    }
  );
}

/* =========================================
   EXCLUIR PACIENTE
========================================= */

export function deletePatient(
  patientId: number
) {
  const current =
    getPatients();

  const next =
    current.filter(
      (
        patient
      ) =>
        patient.id !==
        patientId
    );

  savePatients(
    next
  );
}

/* =========================================
   SALVAR LISTA
========================================= */

function savePatients(
  patients:
    StoredPatient[]
) {
  localStorage.setItem(
    STORAGE_KEY,

    JSON.stringify(
      patients
    )
  );
}

/* =========================================
   GERAR ID
========================================= */

function generatePatientId(
  patients:
    StoredPatient[]
) {
  if (
    patients.length ===
    0
  ) {
    return 1;
  }

  const highestId =
    Math.max(
      ...patients.map(
        (
          patient
        ) =>
          patient.id
      )
    );

  return highestId +
    1;
}

/* =========================================
   NORMALIZAR DOCUMENTO
========================================= */

function normalizeDocument(
  value: string
) {
  return value.replace(
    /\D/g,
    ""
  );
}