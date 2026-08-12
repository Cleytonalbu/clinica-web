export interface SpecialtySetting {
  id: number;
  name: string;
  value: number;
  repasseValue: number;
  active: boolean;
}

export interface RoomSetting {
  id: number;
  name: string;
  active: boolean;
}

export interface ProfessionalSetting {
  id: number;
  name: string;
  specialty: string;
  registration: string;
  active: boolean;

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
  minimumRescheduleHours: number;

  hasLunchBreak: boolean;
  lunchStartTime: string;
  lunchEndTime: string;

  allowExtraAppointment: boolean;
  allowOverlap: boolean;

  blockRoomConflict: boolean;
  blockProfessionalConflict: boolean;
  blockPatientConflict: boolean;

  showOccupiedTimesInRed: boolean;

  reminder24Hours: boolean;
  reminder2Hours: boolean;

  requestConfirmation: boolean;
  autoCancelWithoutConfirmation: boolean;

  allowResponsibleReschedule: boolean;
}

export interface TherapeuticObjectiveSetting {
  id: number;
  name: string;
  category: string;
  specialty: string;
  description: string;
  active: boolean;
}

export interface EvolutionModelFields {
  writtenEvolution: boolean;
  therapeuticObjectives: boolean;
  activitiesPerformed: boolean;
  patientResponse: boolean;
  observedImpacts: boolean;
  generalResult: boolean;
  clinicalObservation: boolean;
  guidanceToFamily: boolean;
  referrals: boolean;
  attachments: boolean;
  nextSessionPlan: boolean;
}

export interface EvolutionModelSetting {
  id: number;
  name: string;
  specialty: string;
  description: string;
  active: boolean;
  fields: EvolutionModelFields;
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

  responsibleCanDisableNotifications: boolean;

  sendOnlyDuringBusinessHours: boolean;
  businessHourStart: string;
  businessHourEnd: string;
}

export interface ResponsibleAppModules {
  agenda: boolean;
  financial: boolean;
  digitalWallet: boolean;
  documents: boolean;
  notifications: boolean;
  observations: boolean;
  therapeuticSummary: boolean;
  professionals: boolean;
}

export interface ResponsibleAppPermissions {
  confirmAppointment: boolean;
  requestReschedule: boolean;
  requestCancellation: boolean;

  downloadDocuments: boolean;
  downloadAttachments: boolean;

  viewPaymentHistory: boolean;
  viewPendingPayments: boolean;

  addWalletCredit: boolean;
  viewWalletHistory: boolean;

  viewProfessionalName: boolean;
  viewSpecialtyName: boolean;

  viewClinicalObservations: boolean;
  viewTherapeuticProgress: boolean;
}

export interface ResponsibleAppSettings {
  enabled: boolean;

  appName: string;

  welcomeMessage: string;

  supportPhone: string;

  supportEmail: string;

  showClinicLogo: boolean;

  showPatientPhoto: boolean;

  modules: ResponsibleAppModules;

  permissions: ResponsibleAppPermissions;

  allowBiometricLogin: boolean;

  allowPasswordRecovery: boolean;

  sessionTimeoutMinutes: number;

  showFinancialValuesOnHome: boolean;

  showNextAppointmentOnHome: boolean;

  showUnreadNotificationsOnHome: boolean;
}

export type PermissionModuleKey =
  | "dashboard"
  | "patients"
  | "agenda"
  | "professionals"
  | "financial"
  | "evolutions"
  | "documents"
  | "reports"
  | "settings";

export interface ModulePermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
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

  restrictProfessionalsToOwnPatients: boolean;

  restrictProfessionalsToOwnAgenda: boolean;

  restrictProfessionalsToOwnEvolutions: boolean;

  hideFinancialValuesFromProfessionals: boolean;

  allowReceptionToViewClinicalData: boolean;

  allowReceptionToEditPatientData: boolean;
}

export type PaymentMethodKey =
  | "pix"
  | "cash"
  | "creditCard"
  | "debitCard"
  | "bankTransfer"
  | "boleto"
  | "digitalWallet";

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

  digitalWalletEnabled: boolean;

  allowResponsibleWalletDeposit: boolean;

  minimumWalletDeposit: number;

  walletLowBalanceWarning: boolean;

  walletLowBalanceAmount: number;

  useWalletAutomatically: boolean;

  notifyBeforeDueDate: boolean;

  daysBeforeDueDate: number;

  notifyAfterDueDate: boolean;

  daysAfterDueDate: number;
}

export type ReportTypeKey =
  | "clinical"
  | "financial"
  | "appointments"
  | "patients"
  | "professionals"
  | "attendance"
  | "evolution"
  | "wallet";

export interface ReportTypeSetting {
  id: number;

  key: ReportTypeKey;

  name: string;

  description: string;

  active: boolean;

  allowPdf: boolean;

  allowExcel: boolean;

  allowPrint: boolean;

  includeCharts: boolean;
}

export type ReportOrientation =
  | "portrait"
  | "landscape";

export type ReportPaperSize =
  | "A4"
  | "Letter";

export interface ReportsSettings {
  reportTypes: ReportTypeSetting[];

  showClinicLogo: boolean;

  showClinicName: boolean;

  showClinicDocument: boolean;

  showClinicAddress: boolean;

  showClinicPhone: boolean;

  showClinicEmail: boolean;

  showGenerationDate: boolean;

  showGeneratedBy: boolean;

  showPatientDocument: boolean;

  showProfessionalRegistration: boolean;

  showPageNumbers: boolean;

  includeHeader: boolean;

  includeFooter: boolean;

  headerText: string;

  footerText: string;

  includeProfessionalSignature: boolean;

  includeTechnicalResponsibleSignature: boolean;

  technicalResponsibleName: string;

  technicalResponsibleRegistration: string;

  defaultOrientation: ReportOrientation;

  paperSize: ReportPaperSize;

  defaultIncludeCharts: boolean;

  defaultIncludeInactiveRecords: boolean;

  defaultIncludeFinancialValues: boolean;

  allowSensitiveClinicalData: boolean;

  anonymizePatientData: boolean;

  requireReasonForSensitiveReport: boolean;

  keepGenerationHistory: boolean;

  generationHistoryDays: number;

  allowPdfExport: boolean;

  allowExcelExport: boolean;

  allowPrinting: boolean;
}

export type SystemLanguage =
  | "pt-BR"
  | "en-US"
  | "es";

export type SystemTheme =
  | "light"
  | "dark"
  | "system";

export type SystemDateFormat =
  | "DD/MM/YYYY"
  | "MM/DD/YYYY"
  | "YYYY-MM-DD";

export type SystemTimeFormat =
  | "24h"
  | "12h";

export interface GeneralSettings {
  language: SystemLanguage;

  theme: SystemTheme;

  dateFormat: SystemDateFormat;

  timeFormat: SystemTimeFormat;

  timezone: string;

  compactSidebar: boolean;

  rememberLastPage: boolean;

  showBreadcrumbs: boolean;

  showQuickActions: boolean;

  showWelcomeMessage: boolean;

  confirmBeforeDelete: boolean;

  confirmBeforeLogout: boolean;

  autosaveForms: boolean;

  autosaveIntervalSeconds: number;

  enableSessionTimeout: boolean;

  sessionTimeoutMinutes: number;

  warnBeforeSessionTimeout: boolean;

  sessionTimeoutWarningMinutes: number;

  forcePasswordChange: boolean;

  passwordExpirationDays: number;

  minimumPasswordLength: number;

  requireUppercasePassword: boolean;

  requireNumberPassword: boolean;

  requireSpecialCharacterPassword: boolean;

  enableTwoFactorAuthentication: boolean;

  logFailedLoginAttempts: boolean;

  maxFailedLoginAttempts: number;

  enableAuditLog: boolean;

  auditLoginEvents: boolean;

  auditDataChanges: boolean;

  auditDeletes: boolean;

  auditExports: boolean;

  auditConfigurationChanges: boolean;

  auditRetentionDays: number;

  enableAutomaticBackup: boolean;

  backupFrequency: "daily" | "weekly" | "monthly";

  backupRetentionDays: number;

  maintenanceMode: boolean;

  maintenanceMessage: string;

  allowAdministratorAccessDuringMaintenance: boolean;

  checkForUpdatesAutomatically: boolean;

  showSystemVersion: boolean;

  enableInternalNotifications: boolean;

  enableSoundNotifications: boolean;
}

export interface SystemSettings {
  specialties: SpecialtySetting[];

  rooms: RoomSetting[];

  professionals: ProfessionalSetting[];

  convenios: ConvenioSetting[];

  agenda: AgendaSettings;

  objectives: TherapeuticObjectiveSetting[];

  evolutionModels: EvolutionModelSetting[];

  notifications: NotificationSettings;

  responsibleApp: ResponsibleAppSettings;

  permissions: PermissionsSettings;

  financial: FinancialSettings;

  reports: ReportsSettings;

  general: GeneralSettings;
}

const STORAGE_KEY =
  "entre-afetos-system-settings";

const fullPermission: ModulePermission = {
  view: true,
  create: true,
  edit: true,
  delete: true,
  manage: true,
};

const viewOnlyPermission: ModulePermission = {
  view: true,
  create: false,
  edit: false,
  delete: false,
  manage: false,
};

const noPermission: ModulePermission = {
  view: false,
  create: false,
  edit: false,
  delete: false,
  manage: false,
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

  minimumRescheduleHours: 24,

  hasLunchBreak: true,

  lunchStartTime: "12:00",

  lunchEndTime: "13:00",

  allowExtraAppointment: true,

  allowOverlap: false,

  blockRoomConflict: true,

  blockProfessionalConflict: true,

  blockPatientConflict: true,

  showOccupiedTimesInRed: true,

  reminder24Hours: true,

  reminder2Hours: true,

  requestConfirmation: true,

  autoCancelWithoutConfirmation: false,

  allowResponsibleReschedule: true,
};

export const defaultEvolutionFields: EvolutionModelFields = {
  writtenEvolution: true,

  therapeuticObjectives: true,

  activitiesPerformed: true,

  patientResponse: true,

  observedImpacts: true,

  generalResult: true,

  clinicalObservation: true,

  guidanceToFamily: false,

  referrals: true,

  attachments: true,

  nextSessionPlan: false,
};

const defaultObjectives: TherapeuticObjectiveSetting[] = [
  {
    id: 1,
    name: "Comunicação funcional",
    category: "Comunicação",
    specialty: "Fonoaudiologia",
    description:
      "Estimular o uso funcional da comunicação em situações do cotidiano.",
    active: true,
  },

  {
    id: 2,
    name: "Interação social",
    category: "Habilidades sociais",
    specialty: "Psicologia",
    description:
      "Desenvolver habilidades de interação, troca e participação social.",
    active: true,
  },

  {
    id: 3,
    name: "Autorregulação emocional",
    category: "Regulação emocional",
    specialty: "Psicologia",
    description:
      "Ampliar estratégias de identificação e regulação das emoções.",
    active: true,
  },

  {
    id: 4,
    name: "Autonomia nas atividades",
    category: "Autonomia",
    specialty: "Terapia Ocupacional",
    description:
      "Promover maior independência nas atividades de vida diária.",
    active: true,
  },

  {
    id: 5,
    name: "Atenção e concentração",
    category: "Cognição",
    specialty: "Psicopedagogia",
    description:
      "Desenvolver manutenção da atenção e concentração durante atividades.",
    active: true,
  },

  {
    id: 6,
    name: "Coordenação motora",
    category: "Desenvolvimento motor",
    specialty: "Fisioterapia",
    description:
      "Estimular coordenação, equilíbrio e organização dos movimentos.",
    active: true,
  },
];

const defaultEvolutionModels: EvolutionModelSetting[] = [
  {
    id: 1,

    name: "Evolução Padrão - Psicologia",

    specialty: "Psicologia",

    description:
      "Modelo padrão para registro de atendimentos psicológicos.",

    active: true,

    fields: {
      ...defaultEvolutionFields,

      guidanceToFamily: true,

      nextSessionPlan: true,
    },
  },

  {
    id: 2,

    name: "Evolução Padrão - Fonoaudiologia",

    specialty: "Fonoaudiologia",

    description:
      "Modelo padrão para registro de atendimentos fonoaudiológicos.",

    active: true,

    fields: {
      ...defaultEvolutionFields,

      guidanceToFamily: true,

      nextSessionPlan: true,
    },
  },

  {
    id: 3,

    name: "Evolução Padrão - Terapia Ocupacional",

    specialty: "Terapia Ocupacional",

    description:
      "Modelo padrão para registro de atendimentos de terapia ocupacional.",

    active: true,

    fields: {
      ...defaultEvolutionFields,

      guidanceToFamily: true,

      nextSessionPlan: true,
    },
  },
];

const defaultNotificationSettings: NotificationSettings = {
  enableWhatsApp: true,

  enableEmail: true,

  enablePush: true,

  responsibleCanDisableNotifications: true,

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
        whatsapp: true,
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
        whatsapp: true,
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
        whatsapp: true,
        email: true,
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
        whatsapp: true,
        email: true,
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
        whatsapp: true,
        email: true,
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
        email: true,
        push: true,
      },

      message:
        "Pagamento de {valor} confirmado com sucesso. Obrigado.",
    },
  ],
};

const defaultResponsibleAppSettings: ResponsibleAppSettings = {
  enabled: true,

  appName: "Entre Afetos",

  welcomeMessage:
    "Bem-vindo ao aplicativo da Clínica Integrada Entre Afetos.",

  supportPhone:
    "(83) 99999-9999",

  supportEmail:
    "contato@entreafetos.com.br",

  showClinicLogo: true,

  showPatientPhoto: true,

  modules: {
    agenda: true,

    financial: true,

    digitalWallet: true,

    documents: true,

    notifications: true,

    observations: true,

    therapeuticSummary: true,

    professionals: true,
  },

  permissions: {
    confirmAppointment: true,

    requestReschedule: true,

    requestCancellation: false,

    downloadDocuments: true,

    downloadAttachments: true,

    viewPaymentHistory: true,

    viewPendingPayments: true,

    addWalletCredit: true,

    viewWalletHistory: true,

    viewProfessionalName: true,

    viewSpecialtyName: true,

    viewClinicalObservations: true,

    viewTherapeuticProgress: true,
  },

  allowBiometricLogin: true,

  allowPasswordRecovery: true,

  sessionTimeoutMinutes: 60,

  showFinancialValuesOnHome: false,

  showNextAppointmentOnHome: true,

  showUnreadNotificationsOnHome: true,
};

const defaultPermissionsSettings: PermissionsSettings = {
  restrictProfessionalsToOwnPatients: true,

  restrictProfessionalsToOwnAgenda: true,

  restrictProfessionalsToOwnEvolutions: true,

  hideFinancialValuesFromProfessionals: true,

  allowReceptionToViewClinicalData: false,

  allowReceptionToEditPatientData: true,

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

        professionals: {
          ...fullPermission,
        },

        financial: {
          ...fullPermission,
        },

        evolutions: {
          ...fullPermission,
        },

        documents: {
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
          delete: false,
          manage: false,
        },

        agenda: {
          view: true,
          create: true,
          edit: true,
          delete: true,
          manage: false,
        },

        professionals: {
          ...viewOnlyPermission,
        },

        financial: {
          view: true,
          create: true,
          edit: true,
          delete: false,
          manage: false,
        },

        evolutions: {
          ...noPermission,
        },

        documents: {
          view: true,
          create: true,
          edit: true,
          delete: false,
          manage: false,
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
          delete: false,
          manage: false,
        },

        professionals: {
          ...noPermission,
        },

        financial: {
          ...noPermission,
        },

        evolutions: {
          view: true,
          create: true,
          edit: true,
          delete: false,
          manage: false,
        },

        documents: {
          view: true,
          create: true,
          edit: false,
          delete: false,
          manage: false,
        },

        reports: {
          view: true,
          create: true,
          edit: false,
          delete: false,
          manage: false,
        },

        settings: {
          ...noPermission,
        },
      },
    },
  ],
};

const defaultFinancialSettings: FinancialSettings = {
  paymentMethods: [
    {
      id: 1,
      key: "pix",
      name: "PIX",
      active: true,
      allowInstallments: false,
      maxInstallments: 1,
      feePercent: 0,
    },

    {
      id: 2,
      key: "cash",
      name: "Dinheiro",
      active: true,
      allowInstallments: false,
      maxInstallments: 1,
      feePercent: 0,
    },

    {
      id: 3,
      key: "creditCard",
      name: "Cartão de crédito",
      active: true,
      allowInstallments: true,
      maxInstallments: 12,
      feePercent: 3.49,
    },

    {
      id: 4,
      key: "debitCard",
      name: "Cartão de débito",
      active: true,
      allowInstallments: false,
      maxInstallments: 1,
      feePercent: 1.99,
    },

    {
      id: 5,
      key: "bankTransfer",
      name: "Transferência bancária",
      active: true,
      allowInstallments: false,
      maxInstallments: 1,
      feePercent: 0,
    },

    {
      id: 6,
      key: "boleto",
      name: "Boleto",
      active: false,
      allowInstallments: false,
      maxInstallments: 1,
      feePercent: 0,
    },

    {
      id: 7,
      key: "digitalWallet",
      name: "Carteira digital",
      active: true,
      allowInstallments: false,
      maxInstallments: 1,
      feePercent: 0,
    },
  ],

  defaultDueDay: 10,

  generateChargeAutomatically: true,

  chargeOnAppointmentCreation: false,

  chargeAfterAppointment: true,

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

  digitalWalletEnabled: true,

  allowResponsibleWalletDeposit: true,

  minimumWalletDeposit: 20,

  walletLowBalanceWarning: true,

  walletLowBalanceAmount: 50,

  useWalletAutomatically: false,

  notifyBeforeDueDate: true,

  daysBeforeDueDate: 3,

  notifyAfterDueDate: true,

  daysAfterDueDate: 1,
};

const defaultReportsSettings: ReportsSettings = {
  reportTypes: [
    {
      id: 1,
      key: "clinical",
      name: "Relatório Clínico",
      description:
        "Relatório com informações clínicas e acompanhamento terapêutico.",
      active: true,
      allowPdf: true,
      allowExcel: false,
      allowPrint: true,
      includeCharts: false,
    },

    {
      id: 2,
      key: "financial",
      name: "Relatório Financeiro",
      description:
        "Receitas, pagamentos, pendências e movimentações financeiras.",
      active: true,
      allowPdf: true,
      allowExcel: true,
      allowPrint: true,
      includeCharts: true,
    },

    {
      id: 3,
      key: "appointments",
      name: "Relatório de Agenda",
      description:
        "Atendimentos agendados, realizados, cancelados e faltas.",
      active: true,
      allowPdf: true,
      allowExcel: true,
      allowPrint: true,
      includeCharts: true,
    },

    {
      id: 4,
      key: "patients",
      name: "Relatório de Pacientes",
      description:
        "Informações cadastrais e administrativas dos pacientes.",
      active: true,
      allowPdf: true,
      allowExcel: true,
      allowPrint: true,
      includeCharts: false,
    },

    {
      id: 5,
      key: "professionals",
      name: "Relatório de Profissionais",
      description:
        "Atendimentos, produtividade e informações dos profissionais.",
      active: true,
      allowPdf: true,
      allowExcel: true,
      allowPrint: true,
      includeCharts: true,
    },

    {
      id: 6,
      key: "attendance",
      name: "Relatório de Frequência",
      description:
        "Presenças, faltas e cancelamentos dos pacientes.",
      active: true,
      allowPdf: true,
      allowExcel: true,
      allowPrint: true,
      includeCharts: true,
    },

    {
      id: 7,
      key: "evolution",
      name: "Relatório de Evoluções",
      description:
        "Histórico de evoluções e registros clínicos.",
      active: true,
      allowPdf: true,
      allowExcel: false,
      allowPrint: true,
      includeCharts: false,
    },

    {
      id: 8,
      key: "wallet",
      name: "Relatório da Carteira Digital",
      description:
        "Saldo, depósitos, débitos e movimentações das carteiras.",
      active: true,
      allowPdf: true,
      allowExcel: true,
      allowPrint: true,
      includeCharts: true,
    },
  ],

  showClinicLogo: true,

  showClinicName: true,

  showClinicDocument: true,

  showClinicAddress: true,

  showClinicPhone: true,

  showClinicEmail: true,

  showGenerationDate: true,

  showGeneratedBy: true,

  showPatientDocument: false,

  showProfessionalRegistration: true,

  showPageNumbers: true,

  includeHeader: true,

  includeFooter: true,

  headerText:
    "Clínica Integrada Entre Afetos",

  footerText:
    "Documento gerado pelo sistema Entre Afetos.",

  includeProfessionalSignature: true,

  includeTechnicalResponsibleSignature: false,

  technicalResponsibleName: "",

  technicalResponsibleRegistration: "",

  defaultOrientation: "portrait",

  paperSize: "A4",

  defaultIncludeCharts: true,

  defaultIncludeInactiveRecords: false,

  defaultIncludeFinancialValues: true,

  allowSensitiveClinicalData: true,

  anonymizePatientData: false,

  requireReasonForSensitiveReport: true,

  keepGenerationHistory: true,

  generationHistoryDays: 365,

  allowPdfExport: true,

  allowExcelExport: true,

  allowPrinting: true,
};

const defaultGeneralSettings: GeneralSettings = {
  language: "pt-BR",

  theme: "light",

  dateFormat: "DD/MM/YYYY",

  timeFormat: "24h",

  timezone: "America/Sao_Paulo",

  compactSidebar: false,

  rememberLastPage: true,

  showBreadcrumbs: true,

  showQuickActions: true,

  showWelcomeMessage: true,

  confirmBeforeDelete: true,

  confirmBeforeLogout: false,

  autosaveForms: true,

  autosaveIntervalSeconds: 30,

  enableSessionTimeout: true,

  sessionTimeoutMinutes: 120,

  warnBeforeSessionTimeout: true,

  sessionTimeoutWarningMinutes: 5,

  forcePasswordChange: false,

  passwordExpirationDays: 90,

  minimumPasswordLength: 8,

  requireUppercasePassword: true,

  requireNumberPassword: true,

  requireSpecialCharacterPassword: false,

  enableTwoFactorAuthentication: false,

  logFailedLoginAttempts: true,

  maxFailedLoginAttempts: 5,

  enableAuditLog: true,

  auditLoginEvents: true,

  auditDataChanges: true,

  auditDeletes: true,

  auditExports: true,

  auditConfigurationChanges: true,

  auditRetentionDays: 365,

  enableAutomaticBackup: true,

  backupFrequency: "daily",

  backupRetentionDays: 30,

  maintenanceMode: false,

  maintenanceMessage:
    "Sistema temporariamente indisponível para manutenção.",

  allowAdministratorAccessDuringMaintenance:
    true,

  checkForUpdatesAutomatically: true,

  showSystemVersion: true,

  enableInternalNotifications: true,

  enableSoundNotifications: false,
};

const defaultSettings: SystemSettings = {
  specialties: [
    {
      id: 1,
      name: "Psicologia",
      value: 150,
      repasseValue: 100,
      active: true,
    },

    {
      id: 2,
      name: "Fonoaudiologia",
      value: 140,
      repasseValue: 90,
      active: true,
    },

    {
      id: 3,
      name: "Terapia Ocupacional",
      value: 160,
      repasseValue: 110,
      active: true,
    },

    {
      id: 4,
      name: "Fisioterapia",
      value: 130,
      repasseValue: 90,
      active: true,
    },

    {
      id: 5,
      name: "Psicopedagogia",
      value: 140,
      repasseValue: 90,
      active: true,
    },

    {
      id: 6,
      name: "Nutrição",
      value: 150,
      repasseValue: 100,
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

  objectives:
    defaultObjectives,

  evolutionModels:
    defaultEvolutionModels,

  notifications:
    defaultNotificationSettings,

  responsibleApp:
    defaultResponsibleAppSettings,

  permissions:
    defaultPermissionsSettings,

  financial:
    defaultFinancialSettings,

  reports:
    defaultReportsSettings,

  general:
    defaultGeneralSettings,
};

export function getSystemSettings(): SystemSettings {
  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          defaultSettings
        )
      );

      return defaultSettings;
    }

    const parsed =
      JSON.parse(
        stored
      ) as Partial<SystemSettings>;

    const normalizedAgenda: AgendaSettings = {
      ...defaultAgendaSettings,

      ...(parsed.agenda ?? {}),

      days:
        parsed.agenda?.days ??
        defaultAgendaSettings.days,
    };

    const normalizedNotifications: NotificationSettings = {
      ...defaultNotificationSettings,

      ...(parsed.notifications ?? {}),

      rules:
        parsed.notifications?.rules ??
        defaultNotificationSettings.rules,
    };

    const normalizedResponsibleApp: ResponsibleAppSettings = {
      ...defaultResponsibleAppSettings,

      ...(parsed.responsibleApp ?? {}),

      modules: {
        ...defaultResponsibleAppSettings.modules,

        ...(parsed.responsibleApp?.modules ??
          {}),
      },

      permissions: {
        ...defaultResponsibleAppSettings.permissions,

        ...(parsed.responsibleApp?.permissions ??
          {}),
      },
    };

    const normalizedPermissions: PermissionsSettings = {
      ...defaultPermissionsSettings,

      ...(parsed.permissions ?? {}),

      profiles:
        parsed.permissions?.profiles ??
        defaultPermissionsSettings.profiles,
    };

    const normalizedFinancial: FinancialSettings = {
      ...defaultFinancialSettings,

      ...(parsed.financial ?? {}),

      paymentMethods:
        parsed.financial?.paymentMethods ??
        defaultFinancialSettings.paymentMethods,
    };

    const normalizedReports: ReportsSettings = {
      ...defaultReportsSettings,

      ...(parsed.reports ?? {}),

      reportTypes:
        parsed.reports?.reportTypes ??
        defaultReportsSettings.reportTypes,
    };

    const normalizedGeneral: GeneralSettings = {
      ...defaultGeneralSettings,

      ...(parsed.general ?? {}),
    };

    const normalized: SystemSettings = {
      specialties:
        (parsed.specialties ?? defaultSettings.specialties).map(
          (specialty) => ({
            ...specialty,
            repasseValue:
              specialty.repasseValue ?? 0,
          })
        ),

      rooms:
        parsed.rooms ??
        defaultSettings.rooms,

      professionals:
        (
          parsed.professionals ??
          defaultSettings.professionals
        ).map(
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
          })
        ),

      convenios:
        parsed.convenios ??
        defaultSettings.convenios,

      agenda:
        normalizedAgenda,

      objectives:
        parsed.objectives ??
        defaultSettings.objectives,

      evolutionModels:
        parsed.evolutionModels ??
        defaultSettings.evolutionModels,

      notifications:
        normalizedNotifications,

      responsibleApp:
        normalizedResponsibleApp,

      permissions:
        normalizedPermissions,

      financial:
        normalizedFinancial,

      reports:
        normalizedReports,

      general:
        normalizedGeneral,
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
    (
      professional
    ) =>
      professional.active
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

export function getActiveTherapeuticObjectives() {
  return getSystemSettings().objectives.filter(
    (
      objective
    ) =>
      objective.active
  );
}

export function getTherapeuticObjectivesBySpecialty(
  specialty: string
) {
  return getSystemSettings().objectives.filter(
    (
      objective
    ) =>
      objective.active &&
      objective.specialty ===
        specialty
  );
}

export function getActiveEvolutionModels() {
  return getSystemSettings().evolutionModels.filter(
    (
      model
    ) =>
      model.active
  );
}

export function getEvolutionModelsBySpecialty(
  specialty: string
) {
  return getSystemSettings().evolutionModels.filter(
    (
      model
    ) =>
      model.active &&
      model.specialty ===
        specialty
  );
}

export function getDefaultEvolutionModelBySpecialty(
  specialty: string
) {
  return getSystemSettings().evolutionModels.find(
    (
      model
    ) =>
      model.active &&
      model.specialty ===
        specialty
  );
}

export function getNotificationSettings() {
  return getSystemSettings().notifications;
}

export function getActiveNotificationRules() {
  return getSystemSettings().notifications.rules.filter(
    (
      rule
    ) =>
      rule.active
  );
}

export function getResponsibleAppSettings() {
  return getSystemSettings().responsibleApp;
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

export function getFinancialSettings() {
  return getSystemSettings().financial;
}

export function getActivePaymentMethods() {
  return getSystemSettings().financial.paymentMethods.filter(
    (
      method
    ) =>
      method.active
  );
}

export function getReportsSettings() {
  return getSystemSettings().reports;
}

export function getActiveReportTypes() {
  return getSystemSettings().reports.reportTypes.filter(
    (
      report
    ) =>
      report.active
  );
}

export function getGeneralSettings() {
  return getSystemSettings().general;
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