export interface SpecialtySetting {
  id: number;
  name: string;
  value: number;
  repasseValue: number;

  /** Duração padrão do atendimento desta especialidade, em minutos. */
  durationMinutes: number;

  active: boolean;
}

export interface RoomSetting {
  id: number;
  name: string;
  active: boolean;
}

export type ProfessionalStatus =
  | "Ativo"
  | "Inativo"
  | "Férias";

export interface ProfessionalSetting {
  id: number;
  name: string;
  specialty: string;
  registration: string;
  active: boolean;

  /** Dados do cadastro principal do profissional. */
  status?: ProfessionalStatus;
  birthDate?: string;
  cpf?: string;
  rg?: string;
  phone?: string;
  email?: string;
  councilType?: string;
  councilNumber?: string;
  employmentType?: string;
  admissionDate?: string;
  observations?: string;

  /**
   * Valor específico cobrado do paciente para este profissional.
   * Quando não informado, utiliza o valor padrão da especialidade.
   */
  customValue?: number;

  /**
   * Repasse específico pago ao profissional por atendimento.
   * Quando não informado, utiliza o repasse padrão da especialidade.
   */
  customRepasseValue?: number;
}

export interface ConvenioSetting {
  id: number;
  name: string;
  active: boolean;
  discountPercent: number;
  specialtyValues: Record<string, number>;
}

export interface ClinicSettings {
  clinicName: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface AgendaDaySetting {
  day:
    | "Segunda"
    | "Terça"
    | "Quarta"
    | "Quinta"
    | "Sexta"
    | "Sábado"
    | "Domingo";

  active: boolean;
  startTime: string;
  endTime: string;
}

export interface AgendaSettings {
  days: AgendaDaySetting[];

  defaultSessionDuration: number;
  intervalBetweenAppointments: number;

  hasLunchBreak: boolean;
  lunchStartTime: string;
  lunchEndTime: string;
}

export interface NotificationChannels {
  whatsapp: boolean;
  email: boolean;
  push: boolean;
}

export type NotificationRuleKey =
  | "appointmentReminder"
  | "appointmentConfirmation"
  | "appointmentCancellation"
  | "appointmentReschedule"
  | "financialReminder"
  | "paymentConfirmation";

export interface NotificationRuleSetting {
  id: number;
  key: NotificationRuleKey;
  title: string;
  description: string;
  active: boolean;
  channels: NotificationChannels;
  advanceHours?: number;
  message: string;
}

export interface NotificationSettings {
  rules: NotificationRuleSetting[];

  enableWhatsApp: boolean;
  enableEmail: boolean;
  enablePush: boolean;

  sendOnlyDuringBusinessHours: boolean;
  businessHourStart: string;
  businessHourEnd: string;
}

export type PaymentMethodKey =
  | "pix"
  | "cash"
  | "creditCard"
  | "debitCard"
  | "bankTransfer";

export interface PaymentMethodSetting {
  id: number;
  key: PaymentMethodKey;
  name: string;
  active: boolean;
  allowInstallments: boolean;
  maxInstallments: number;
  feePercent: number;
}

export interface FinancialSettings {
  paymentMethods: PaymentMethodSetting[];
  defaultDueDay: number;
  generateChargeAutomatically: boolean;
  chargeOnAppointmentCreation: boolean;
  chargeAfterAppointment: boolean;
  allowPartialPayment: boolean;
  allowOverpayment: boolean;
  applyLateFee: boolean;
  lateFeePercent: number;
  applyInterest: boolean;
  monthlyInterestPercent: number;
  allowDiscount: boolean;
  maximumDiscountPercent: number;
  generateReceiptAutomatically: boolean;
  showClinicDataOnReceipt: boolean;
  showProfessionalOnReceipt: boolean;
  showPatientOnReceipt: boolean;
  requirePaymentMethodOnConfirmation: boolean;
}

export type PermissionModuleKey =
  | "dashboard"
  | "patients"
  | "agenda"
  | "financial"
  | "evolutions"
  | "reports"
  | "settings";

export interface ModulePermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  manage: boolean;
}

export interface PermissionProfileSetting {
  id: number;

  name: string;

  description: string;

  active: boolean;

  systemProfile: boolean;

  modules: Record<
    PermissionModuleKey,
    ModulePermission
  >;
}

export interface PermissionsSettings {
  profiles: PermissionProfileSetting[];
}

export interface SystemSettings {
  clinic: ClinicSettings;

  specialties: SpecialtySetting[];

  rooms: RoomSetting[];

  professionals: ProfessionalSetting[];

  convenios: ConvenioSetting[];

  agenda: AgendaSettings;

  notifications: NotificationSettings;

  financial: FinancialSettings;

  permissions: PermissionsSettings;
}

const STORAGE_KEY =
  "entre-afetos-system-settings";

const LEGACY_CLINIC_STORAGE_KEY =
  "entre-afetos-clinic-settings";

const fullPermission: ModulePermission = {
  view: true,
  create: true,
  edit: true,
  manage: true,
};

const viewOnlyPermission: ModulePermission = {
  view: true,
  create: false,
  edit: false,
  manage: false,
};

const noPermission: ModulePermission = {
  view: false,
  create: false,
  edit: false,
  manage: false,
};

const defaultClinicSettings: ClinicSettings = {
  clinicName: "Clínica Integrada Entre Afetos",
  cnpj: "35.123.456/0001-00",
  email: "contato@entreafetos.com.br",
  phone: "(83) 99999-9999",
  address: "Rua Exemplo, 123",
  city: "João Pessoa",
  state: "PB",
  zipCode: "58000-000",
};

const defaultAgendaSettings: AgendaSettings = {
  days: [
    {
      day: "Segunda",
      active: true,
      startTime: "08:00",
      endTime: "18:00",
    },

    {
      day: "Terça",
      active: true,
      startTime: "08:00",
      endTime: "18:00",
    },

    {
      day: "Quarta",
      active: true,
      startTime: "08:00",
      endTime: "18:00",
    },

    {
      day: "Quinta",
      active: true,
      startTime: "08:00",
      endTime: "18:00",
    },

    {
      day: "Sexta",
      active: true,
      startTime: "08:00",
      endTime: "18:00",
    },

    {
      day: "Sábado",
      active: true,
      startTime: "08:00",
      endTime: "12:00",
    },

    {
      day: "Domingo",
      active: false,
      startTime: "08:00",
      endTime: "12:00",
    },
  ],

  defaultSessionDuration: 50,

  intervalBetweenAppointments: 0,

  hasLunchBreak: true,

  lunchStartTime: "12:00",

  lunchEndTime: "13:00",
};

const defaultNotificationSettings: NotificationSettings = {
  enableWhatsApp: false,

  enableEmail: false,

  enablePush: true,

  sendOnlyDuringBusinessHours: true,

  businessHourStart: "08:00",

  businessHourEnd: "18:00",

  rules: [
    {
      id: 1,

      key: "appointmentReminder",

      title: "Lembrete de consulta",

      description:
        "Aviso enviado antes do horário agendado.",

      active: true,

      channels: {
        whatsapp: false,
        email: false,
        push: true,
      },

      advanceHours: 24,

      message:
        "Olá, {responsavel}. Lembramos que {paciente} possui atendimento em {data} às {hora} com {profissional}.",
    },

    {
      id: 2,

      key: "appointmentConfirmation",

      title: "Confirmação de presença",

      description:
        "Solicitação para o responsável confirmar o atendimento.",

      active: true,

      channels: {
        whatsapp: false,
        email: false,
        push: true,
      },

      advanceHours: 24,

      message:
        "Olá, {responsavel}. Confirme a presença de {paciente} no atendimento de {data} às {hora}.",
    },

    {
      id: 3,

      key: "appointmentCancellation",

      title: "Cancelamento de atendimento",

      description:
        "Aviso automático quando um atendimento for cancelado.",

      active: true,

      channels: {
        whatsapp: false,
        email: false,
        push: true,
      },

      message:
        "O atendimento de {paciente}, agendado para {data} às {hora}, foi cancelado.",
    },

    {
      id: 4,

      key: "appointmentReschedule",

      title: "Reagendamento",

      description:
        "Aviso quando data ou horário do atendimento forem alterados.",

      active: true,

      channels: {
        whatsapp: false,
        email: false,
        push: true,
      },

      message:
        "O atendimento de {paciente} foi reagendado para {data} às {hora}.",
    },

    {
      id: 5,

      key: "financialReminder",

      title: "Lembrete financeiro",

      description:
        "Aviso sobre cobrança ou vencimento pendente.",

      active: true,

      channels: {
        whatsapp: false,
        email: false,
        push: true,
      },

      advanceHours: 24,

      message:
        "Olá, {responsavel}. Existe uma cobrança de {valor} com vencimento em {vencimento}.",
    },

    {
      id: 6,

      key: "paymentConfirmation",

      title: "Confirmação de pagamento",

      description:
        "Aviso enviado após a confirmação de um pagamento.",

      active: true,

      channels: {
        whatsapp: false,
        email: false,
        push: true,
      },

      message:
        "Pagamento de {valor} confirmado com sucesso. Obrigado.",
    },
  ],
};

const defaultFinancialSettings: FinancialSettings = {
  paymentMethods: [
    { id: 1, key: "pix", name: "Pix", active: true, allowInstallments: false, maxInstallments: 1, feePercent: 0 },
    { id: 2, key: "cash", name: "Dinheiro", active: true, allowInstallments: false, maxInstallments: 1, feePercent: 0 },
    { id: 3, key: "creditCard", name: "Cartão de crédito", active: true, allowInstallments: true, maxInstallments: 12, feePercent: 3.49 },
    { id: 4, key: "debitCard", name: "Cartão de débito", active: true, allowInstallments: false, maxInstallments: 1, feePercent: 1.99 },
    { id: 5, key: "bankTransfer", name: "Transferência", active: true, allowInstallments: false, maxInstallments: 1, feePercent: 0 },
  ],
  defaultDueDay: 10,
  generateChargeAutomatically: true,
  chargeOnAppointmentCreation: true,
  chargeAfterAppointment: false,
  allowPartialPayment: true,
  allowOverpayment: false,
  applyLateFee: true,
  lateFeePercent: 2,
  applyInterest: true,
  monthlyInterestPercent: 1,
  allowDiscount: true,
  maximumDiscountPercent: 20,
  generateReceiptAutomatically: true,
  showClinicDataOnReceipt: true,
  showProfessionalOnReceipt: true,
  showPatientOnReceipt: true,
  requirePaymentMethodOnConfirmation: true,
};

const defaultPermissionsSettings: PermissionsSettings = {
  profiles: [
    {
      id: 1,

      name: "Gestor",

      description:
        "Acesso administrativo completo ao sistema.",

      active: true,

      systemProfile: true,

      modules: {
        dashboard: {
          ...fullPermission,
        },

        patients: {
          ...fullPermission,
        },

        agenda: {
          ...fullPermission,
        },

        financial: {
          ...fullPermission,
        },

        evolutions: {
          ...fullPermission,
        },

        reports: {
          ...fullPermission,
        },

        settings: {
          ...fullPermission,
        },
      },
    },

    {
      id: 2,

      name: "Recepção",

      description:
        "Acesso operacional para atendimento, agenda e cadastro de pacientes.",

      active: true,

      systemProfile: true,

      modules: {
        dashboard: {
          ...viewOnlyPermission,
        },

        patients: {
          view: true,
          create: true,
          edit: true,
          manage: false,
        },

        agenda: {
          view: true,
          create: true,
          edit: true,
          manage: false,
        },

        financial: {
          view: true,
          create: true,
          edit: true,
          manage: false,
        },

        evolutions: {
          ...noPermission,
        },

        reports: {
          ...viewOnlyPermission,
        },

        settings: {
          ...noPermission,
        },
      },
    },

    {
      id: 3,

      name: "Profissional",

      description:
        "Acesso clínico aos pacientes, agenda, evoluções e documentos vinculados.",

      active: true,

      systemProfile: true,

      modules: {
        dashboard: {
          ...viewOnlyPermission,
        },

        patients: {
          ...viewOnlyPermission,
        },

        agenda: {
          view: true,
          create: false,
          edit: false,
          manage: false,
        },

        financial: {
          ...noPermission,
        },

        evolutions: {
          view: true,
          create: true,
          edit: true,
          manage: false,
        },

        reports: {
          view: true,
          create: true,
          edit: false,
          manage: false,
        },

        settings: {
          ...noPermission,
        },
      },
    },

    {
      id: 4,

      name: "Administrativo",

      description:
        "Acesso às rotinas administrativas, financeiras, repasses, despesas e relatórios, sem acesso clínico.",

      active: true,

      systemProfile: true,

      modules: {
        dashboard: {
          ...viewOnlyPermission,
        },

        patients: {
          ...noPermission,
        },

        agenda: {
          ...noPermission,
        },

        financial: {
          ...fullPermission,
        },

        evolutions: {
          ...noPermission,
        },

        reports: {
          ...viewOnlyPermission,
        },

        settings: {
          ...fullPermission,
        },
      },
    },
  ],
};

const defaultSettings: SystemSettings = {
  clinic:
    defaultClinicSettings,

  specialties: [
    {
      id: 1,
      name: "Psicologia",
      value: 150,
      repasseValue: 100,
      durationMinutes: 50,
      active: true,
    },

    {
      id: 2,
      name: "Fonoaudiologia",
      value: 140,
      repasseValue: 90,
      durationMinutes: 50,
      active: true,
    },

    {
      id: 3,
      name: "Terapia Ocupacional",
      value: 160,
      repasseValue: 110,
      durationMinutes: 50,
      active: true,
    },

    {
      id: 4,
      name: "Fisioterapia",
      value: 130,
      repasseValue: 90,
      durationMinutes: 50,
      active: true,
    },

    {
      id: 5,
      name: "Psicopedagogia",
      value: 140,
      repasseValue: 90,
      durationMinutes: 50,
      active: true,
    },

    {
      id: 6,
      name: "Nutrição",
      value: 150,
      repasseValue: 100,
      durationMinutes: 50,
      active: true,
    },
  ],

  rooms: [
    {
      id: 1,
      name: "Sala 01",
      active: true,
    },

    {
      id: 2,
      name: "Sala 02",
      active: true,
    },

    {
      id: 3,
      name: "Sala 03",
      active: true,
    },

    {
      id: 4,
      name: "Sala 04",
      active: true,
    },
  ],

  professionals: [
    {
      id: 1,
      name: "Dra. Ana Paula",
      specialty: "Psicologia",
      registration: "CRP 00/00001",
      active: true,
    },

    {
      id: 2,
      name: "Dra. Camila Soares",
      specialty: "Fonoaudiologia",
      registration: "CRFa 00001",
      active: true,
    },

    {
      id: 3,
      name: "Dra. Larissa Lima",
      specialty: "Terapia Ocupacional",
      registration: "CREFITO 00001",
      active: true,
    },

    {
      id: 4,
      name: "Dr. Rafael Costa",
      specialty: "Fisioterapia",
      registration: "CREFITO 00002",
      active: true,
    },

    {
      id: 5,
      name: "Dra. Mariana Nutricionista",
      specialty: "Nutrição",
      registration: "CRN TESTE",
      active: true,
    },
  ],

  convenios: [
    {
      id: 1,
      name: "Unimed",
      active: true,
      discountPercent: 20,
      specialtyValues: {},
    },

    {
      id: 2,
      name: "Bradesco Saúde",
      active: true,
      discountPercent: 20,
      specialtyValues: {},
    },

    {
      id: 3,
      name: "SulAmérica",
      active: true,
      discountPercent: 20,
      specialtyValues: {},
    },

    {
      id: 4,
      name: "Hapvida",
      active: true,
      discountPercent: 20,
      specialtyValues: {},
    },

    {
      id: 5,
      name: "Amil",
      active: true,
      discountPercent: 20,
      specialtyValues: {},
    },
  ],

  agenda:
    defaultAgendaSettings,

  notifications:
    defaultNotificationSettings,

  financial:
    defaultFinancialSettings,

  permissions:
    defaultPermissionsSettings,
};

export function getSystemSettings(): SystemSettings {
  try {
    let legacyClinic:
      Partial<ClinicSettings> = {};

    const legacyClinicRaw =
      localStorage.getItem(
        LEGACY_CLINIC_STORAGE_KEY
      );

    if (legacyClinicRaw) {
      try {
        legacyClinic =
          JSON.parse(
            legacyClinicRaw
          ) as Partial<ClinicSettings>;
      } catch {
        legacyClinic = {};
      }
    }

    localStorage.removeItem(
      LEGACY_CLINIC_STORAGE_KEY
    );

    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      const initialSettings = {
        ...defaultSettings,
        clinic: {
          clinicName: legacyClinic.clinicName ?? defaultClinicSettings.clinicName,
          cnpj: legacyClinic.cnpj ?? defaultClinicSettings.cnpj,
          email: legacyClinic.email ?? defaultClinicSettings.email,
          phone: legacyClinic.phone ?? defaultClinicSettings.phone,
          address: legacyClinic.address ?? defaultClinicSettings.address,
          city: legacyClinic.city ?? defaultClinicSettings.city,
          state: legacyClinic.state ?? defaultClinicSettings.state,
          zipCode: legacyClinic.zipCode ?? defaultClinicSettings.zipCode,
        },
      };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          initialSettings
        )
      );

      return initialSettings;
    }

    const parsed =
      JSON.parse(
        stored
      ) as Partial<SystemSettings>;

    const normalizedAgenda: AgendaSettings = {
      days:
        parsed.agenda?.days ??
        defaultAgendaSettings.days,

      defaultSessionDuration:
        parsed.agenda?.defaultSessionDuration ??
        defaultAgendaSettings.defaultSessionDuration,

      intervalBetweenAppointments:
        parsed.agenda?.intervalBetweenAppointments ??
        defaultAgendaSettings.intervalBetweenAppointments,

      hasLunchBreak:
        parsed.agenda?.hasLunchBreak ??
        defaultAgendaSettings.hasLunchBreak,

      lunchStartTime:
        parsed.agenda?.lunchStartTime ??
        defaultAgendaSettings.lunchStartTime,
      lunchEndTime:
        parsed.agenda?.lunchEndTime ??
        defaultAgendaSettings.lunchEndTime,
    };

    const normalizedNotifications: NotificationSettings = {
      enableWhatsApp: false,

      enableEmail: false,

      enablePush: true,

      sendOnlyDuringBusinessHours:
        parsed.notifications?.sendOnlyDuringBusinessHours ??
        defaultNotificationSettings.sendOnlyDuringBusinessHours,

      businessHourStart:
        parsed.notifications?.businessHourStart ??
        defaultNotificationSettings.businessHourStart,

      businessHourEnd:
        parsed.notifications?.businessHourEnd ??
        defaultNotificationSettings.businessHourEnd,

      rules:
        (parsed.notifications?.rules ??
          defaultNotificationSettings.rules).map(
          (rule) => ({
            ...rule,
            channels: {
              whatsapp: false,
              email: false,
              push: true,
            },
          })
        ),
    };

    const normalizedFinancial: FinancialSettings = {
      paymentMethods:
        defaultFinancialSettings.paymentMethods.map(
          (defaultMethod) => {
            const savedMethod =
              parsed.financial?.paymentMethods?.find(
                (method) =>
                  String(method.key) === defaultMethod.key
              );

            return {
              ...defaultMethod,
              ...(savedMethod ?? {}),
              id: defaultMethod.id,
              key: defaultMethod.key,
              name: defaultMethod.name,
            };
          }
        ),
      defaultDueDay: parsed.financial?.defaultDueDay ?? defaultFinancialSettings.defaultDueDay,
      generateChargeAutomatically: parsed.financial?.generateChargeAutomatically ?? defaultFinancialSettings.generateChargeAutomatically,
      chargeOnAppointmentCreation: parsed.financial?.chargeOnAppointmentCreation ?? defaultFinancialSettings.chargeOnAppointmentCreation,
      chargeAfterAppointment: parsed.financial?.chargeAfterAppointment ?? defaultFinancialSettings.chargeAfterAppointment,
      allowPartialPayment: parsed.financial?.allowPartialPayment ?? defaultFinancialSettings.allowPartialPayment,
      allowOverpayment: parsed.financial?.allowOverpayment ?? defaultFinancialSettings.allowOverpayment,
      applyLateFee: parsed.financial?.applyLateFee ?? defaultFinancialSettings.applyLateFee,
      lateFeePercent: parsed.financial?.lateFeePercent ?? defaultFinancialSettings.lateFeePercent,
      applyInterest: parsed.financial?.applyInterest ?? defaultFinancialSettings.applyInterest,
      monthlyInterestPercent: parsed.financial?.monthlyInterestPercent ?? defaultFinancialSettings.monthlyInterestPercent,
      allowDiscount: parsed.financial?.allowDiscount ?? defaultFinancialSettings.allowDiscount,
      maximumDiscountPercent: parsed.financial?.maximumDiscountPercent ?? defaultFinancialSettings.maximumDiscountPercent,
      generateReceiptAutomatically: parsed.financial?.generateReceiptAutomatically ?? defaultFinancialSettings.generateReceiptAutomatically,
      showClinicDataOnReceipt: parsed.financial?.showClinicDataOnReceipt ?? defaultFinancialSettings.showClinicDataOnReceipt,
      showProfessionalOnReceipt: parsed.financial?.showProfessionalOnReceipt ?? defaultFinancialSettings.showProfessionalOnReceipt,
      showPatientOnReceipt: parsed.financial?.showPatientOnReceipt ?? defaultFinancialSettings.showPatientOnReceipt,
      requirePaymentMethodOnConfirmation: parsed.financial?.requirePaymentMethodOnConfirmation ?? defaultFinancialSettings.requirePaymentMethodOnConfirmation,
    };

    const mergedClinic = {
      ...defaultClinicSettings,
      ...legacyClinic,
      ...(parsed.clinic ?? {}),
    };

    const savedProfiles =
      Array.isArray(parsed.permissions?.profiles)
        ? parsed.permissions.profiles
        : [];

    /*
     * O login e as rotas trabalham com quatro perfis canônicos.
     * Versões anteriores permitiam criar perfis personalizados que
     * nunca podiam ser atribuídos a um usuário. A normalização remove
     * esses registros sem efeito e completa permissões ausentes de
     * instalações antigas.
     */
    const normalizedPermissions: PermissionsSettings = {
      profiles:
        defaultPermissionsSettings.profiles.map(
          (defaultProfile) => {
            const savedProfile =
              savedProfiles.find(
                (profile) =>
                  profile.name ===
                  defaultProfile.name
              );

            if (
              defaultProfile.name ===
              "Gestor"
            ) {
              return {
                ...defaultProfile,
                modules:
                  Object.fromEntries(
                    Object.keys(defaultProfile.modules).map(
                      (module) => [
                        module,
                        { ...fullPermission },
                      ]
                    )
                  ) as PermissionProfileSetting["modules"],
              };
            }

            const modules =
              Object.fromEntries(
                Object.entries(defaultProfile.modules).map(
                  ([module, fallback]) => {
                    const savedPermission =
                      savedProfile?.modules?.[
                        module as PermissionModuleKey
                      ];

                    const merged = {
                      ...fallback,
                      ...(savedPermission ?? {}),
                    };

                    const view =
                      Boolean(
                        merged.view ||
                        merged.create ||
                        merged.edit ||
                        merged.manage
                      );

                    return [
                      module,
                      {
                        view,
                        create:
                          view && Boolean(merged.create),
                        edit:
                          view && Boolean(merged.edit),
                        manage:
                          view && Boolean(merged.manage),
                      },
                    ];
                  }
                )
              ) as PermissionProfileSetting["modules"];

            /* Configurações é uma área administrativa e exige gestão. */
            if (
              defaultProfile.name ===
              "Administrativo"
            ) {
              modules.settings = {
                ...fullPermission,
              };
            }

            return {
              ...defaultProfile,
              description:
                savedProfile?.description?.trim() ||
                defaultProfile.description,
              active:
                savedProfile?.active ??
                defaultProfile.active,
              modules,
            };
          }
        ),
    };

    const normalized: SystemSettings = {
      clinic: {
        clinicName: mergedClinic.clinicName,
        cnpj: mergedClinic.cnpj,
        email: mergedClinic.email,
        phone: mergedClinic.phone,
        address: mergedClinic.address,
        city: mergedClinic.city,
        state: mergedClinic.state,
        zipCode: mergedClinic.zipCode,
      },

      specialties:
        (parsed.specialties ?? defaultSettings.specialties).map(
          (specialty) => ({
            ...specialty,
            repasseValue:
              specialty.repasseValue ?? 0,
            durationMinutes:
              specialty.durationMinutes ?? 50,
          })
        ),

      rooms:
        parsed.rooms ??
        defaultSettings.rooms,

      professionals:
        [
          ...(
            parsed.professionals ??
            []
          ),

          ...defaultSettings.professionals.filter(
            (
              defaultProfessional
            ) =>
              !(
                parsed.professionals ??
                []
              ).some(
                (
                  professional
                ) =>
                  professional.id ===
                    defaultProfessional.id ||
                  professional.name
                    .trim()
                    .toLocaleLowerCase(
                      "pt-BR"
                    ) ===
                    defaultProfessional.name
                      .trim()
                      .toLocaleLowerCase(
                        "pt-BR"
                      )
              )
          ),
        ].map(
          (
            professional
          ) => ({
            ...professional,

            customValue:
              professional.customValue !== undefined &&
              professional.customValue >= 0
                ? professional.customValue
                : undefined,

            customRepasseValue:
              professional.customRepasseValue !== undefined &&
              professional.customRepasseValue >= 0
                ? professional.customRepasseValue
                : undefined,

            status:
              professional.status ??
              (professional.active
                ? "Ativo"
                : "Inativo"),
          })
        ),

      convenios:
        parsed.convenios ??
        defaultSettings.convenios,

      agenda:
        normalizedAgenda,

      notifications:
        normalizedNotifications,

      financial:
        normalizedFinancial,

      permissions:
        normalizedPermissions,
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        normalized
      )
    );

    return normalized;
  } catch {
    return defaultSettings;
  }
}

export function saveSystemSettings(
  settings: SystemSettings
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      settings
    )
  );
}

export function getActiveSpecialties() {
  return getSystemSettings().specialties.filter(
    (
      specialty
    ) =>
      specialty.active
  );
}

export function getActiveRooms() {
  return getSystemSettings().rooms.filter(
    (
      room
    ) =>
      room.active
  );
}

export function getActiveProfessionals() {
  return getSystemSettings().professionals.filter(
    (professional) =>
      professional.active &&
      professional.status !== "Inativo" &&
      professional.status !== "Férias"
  );
}

export function getActiveConvenios() {
  return getSystemSettings().convenios.filter(
    (
      convenio
    ) =>
      convenio.active
  );
}

export function getAgendaSettings() {
  return getSystemSettings().agenda;
}

export function getClinicSettings() {
  return getSystemSettings().clinic;
}

export function getFinancialSettings() {
  return getSystemSettings().financial;
}

export function getActivePaymentMethods() {
  return getFinancialSettings().paymentMethods.filter(
    (method) =>
      method.active
  );
}

export function getPermissionsSettings() {
  return getSystemSettings().permissions;
}

export function getActivePermissionProfiles() {
  return getSystemSettings().permissions.profiles.filter(
    (
      profile
    ) =>
      profile.active
  );
}

export function getPermissionProfileByName(
  profileName: string
) {
  return getSystemSettings().permissions.profiles.find(
    (
      profile
    ) =>
      profile.name ===
      profileName
  );
}

export function canProfileAccessModule(
  profileName: string,
  module:
    PermissionModuleKey
) {
  const profile =
    getPermissionProfileByName(
      profileName
    );

  return (
    profile?.active ===
      true &&
    profile.modules[
      module
    ].view
  );
}

export function getProfessionalById(
  professionalId: number
) {
  return getSystemSettings().professionals.find(
    (professional) =>
      professional.id === professionalId
  );
}

export function getProfessionalByName(
  name: string
) {
  return getSystemSettings().professionals.find(
    (
      professional
    ) =>
      professional.name ===
      name
  );
}

export function getProfessionalServiceValue(
  professionalName: string,
  specialtyName: string
) {
  const settings =
    getSystemSettings();

  const professional =
    settings.professionals.find(
      (
        item
      ) =>
        item.name ===
        professionalName
    );

  if (
    professional?.customValue !==
      undefined &&
    professional.customValue >
      0
  ) {
    return professional.customValue;
  }

  const specialty =
    settings.specialties.find(
      (
        item
      ) =>
        item.name ===
        specialtyName
    );

  return specialty?.value ?? 150;
}

export function getProfessionalRepasseValue(
  professionalName: string,
  specialtyName: string
) {
  const settings =
    getSystemSettings();

  const professional =
    settings.professionals.find(
      (
        item
      ) =>
        item.name ===
        professionalName
    );

  if (
    professional?.customRepasseValue !==
      undefined &&
    professional.customRepasseValue >=
      0
  ) {
    return professional.customRepasseValue;
  }

  const specialty =
    settings.specialties.find(
      (
        item
      ) =>
        item.name ===
        specialtyName
    );

  return specialty?.repasseValue ?? 0;
}

export function getConvenioServiceValue(
  convenioName: string,
  professionalName: string,
  specialtyName: string
) {
  const settings =
    getSystemSettings();

  const baseValue =
    getProfessionalServiceValue(
      professionalName,
      specialtyName
    );

  const convenio =
    settings.convenios.find(
      (
        item
      ) =>
        item.name ===
        convenioName
    );

  if (
    !convenio ||
    !convenio.active
  ) {
    return baseValue;
  }

  const specialtyValue =
    convenio.specialtyValues[
      specialtyName
    ];

  if (
    specialtyValue !==
      undefined &&
    specialtyValue >
      0
  ) {
    return specialtyValue;
  }

  const discount =
    Math.max(
      Math.min(
        convenio.discountPercent,
        100
      ),
      0
    );

  return (
    baseValue *
    (
      1 -
      discount / 100
    )
  );
}
