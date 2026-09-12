import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  PenLine,
  Printer,
  Save,
  Send,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useAuth,
} from "@/auth/AuthContext";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import reportLetterhead from "@/assets/timbre-relatorios-entre-afetos-2026.jpeg";
import abaPortfolioCover from "@/assets/portfolio-aba-capa.jpg";
import abaPortfolioLetterhead from "@/assets/portfolio-aba-timbre.jpeg";

import {
  getPatientById,
} from "@/pages/Pacientes/patientStorage";

import {
  getObjectivesByPatientId,
} from "@/pages/Pacientes/objectiveStorage";

import {
  getActiveProfessionals,
} from "@/pages/Configuracoes/settingsStorage";

import {
  getProfessionalDetailsById,
} from "@/pages/Profissionais/professionalDetailsStorage";

import {
  getReportRequests,
  isProfessionalResponsibleForItem,
  updateReportRequestItemStatus,
} from "@/pages/SolicitacoesRelatorios/reportRequestStorage";

import {
  getRequestedReportDocument,
  saveRequestedReportDocument,
} from "@/pages/SolicitacoesRelatorios/reportDocumentStorage";

function todayIso() {
  return new Date()
    .toISOString()
    .slice(
      0,
      10
    );
}

function normalize(
  value:
    string | undefined | null
) {
  return (
    value ?? ""
  )
    .trim()
    .toLocaleLowerCase(
      "pt-BR"
    );
}

function formatDate(
  value: string
) {
  if (!value) {
    return "";
  }

  const [
    year,
    month,
    day,
  ] =
    value.split("-");

  if (
    !year ||
    !month ||
    !day
  ) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function formatLongDate(
  value: string
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(
      `${value}T12:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  const formatted =
    new Intl.DateTimeFormat(
      "pt-BR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    ).format(
      date
    );

  return formatted.replace(
    " de ",
    " de "
  );
}

function calculateAge(
  birthDate: string
) {
  if (!birthDate) {
    return "";
  }

  const birth =
    new Date(
      `${birthDate}T12:00:00`
    );

  if (
    Number.isNaN(
      birth.getTime()
    )
  ) {
    return "";
  }

  const today =
    new Date();

  let age =
    today.getFullYear() -
    birth.getFullYear();

  const monthDifference =
    today.getMonth() -
    birth.getMonth();

  if (
    monthDifference <
      0 ||
    (
      monthDifference ===
        0 &&
      today.getDate() <
        birth.getDate()
    )
  ) {
    age -= 1;
  }

  return age >= 0
    ? `${age} anos`
    : "";
}

function professionLabel(
  specialty: string
) {
  const normalized =
    normalize(
      specialty
    );

  if (
    normalized.includes(
      "fono"
    )
  ) {
    return "Fonoaudiólogo(a)";
  }

  if (
    normalized.includes(
      "psicologia"
    )
  ) {
    return "Psicólogo(a)";
  }

  if (
    normalized.includes(
      "psicopedagog"
    )
  ) {
    return "Psicopedagogo(a)";
  }

  if (
    normalized.includes(
      "terapia ocupacional"
    )
  ) {
    return "Terapeuta Ocupacional";
  }

  if (
    normalized.includes(
      "fisioterapia"
    )
  ) {
    return "Fisioterapeuta";
  }

  if (
    normalized.includes(
      "nutri"
    )
  ) {
    return "Nutricionista";
  }

  return specialty;
}


function PortfolioTitle({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "peach" | "green" | "purple";
}) {
  const toneClass =
    tone === "peach"
      ? "bg-[#ed9d83]"
      : tone === "green"
        ? "bg-[#acd85a]"
        : "bg-[#8749ef]";

  return (
    <div className="mb-12 text-center">
      <span
        className={`inline-block px-5 py-2 text-[30px] font-extrabold uppercase text-white ${toneClass}`}
      >
        {children}
      </span>
    </div>
  );
}

function PortfolioTextField({
  label,
  value,
  onChange,
  editable,
  tone,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  editable: boolean;
  tone: "peach" | "orange" | "purple";
  rows?: number;
}) {
  const borderColor =
    tone === "peach"
      ? "#df9a85"
      : tone === "orange"
        ? "#e99b21"
        : "#8547e9";

  const textareaRef =
    useRef<HTMLTextAreaElement | null>(
      null
    );

  useEffect(
    () => {
      if (
        !editable ||
        !textareaRef.current
      ) {
        return;
      }

      const element =
        textareaRef.current;

      element.style.height =
        "auto";

      element.style.height =
        `${Math.max(
          element.scrollHeight,
          42
        )}px`;
    },
    [
      editable,
      value,
    ]
  );

  return (
    <div className="mb-5">
      <p className="mb-2 text-[20px] font-extrabold leading-tight text-[#525252]">
        {label}
      </p>

      {editable ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          rows={1}
          className="portfolio-field-input no-print-adjust"
          style={{
            borderColor,
          }}
        />
      ) : (
        <div
          className="portfolio-field-value"
          style={{
            borderColor,
          }}
        >
          {value || " "}
        </div>
      )}
    </div>
  );
}

export default function RelatorioSolicitado() {
  const {
    user,
  } =
    useAuth();

  const navigate =
    useNavigate();

  const {
    requestId = "",
    itemId = "",
  } =
    useParams();

  const request =
    useMemo(
      () =>
        getReportRequests().find(
          (
            item
          ) =>
            item.id ===
            requestId
        ),
      [
        requestId,
      ]
    )!;

  const requestItem =
    request?.items.find(
      (
        item
      ) =>
        item.id ===
        itemId
    )!;

  const patient =
    request
      ? getPatientById(
          request.patientId
        )
      : undefined;

  const professional =
    useMemo(
      () =>
        getActiveProfessionals().find(
          (
            item
          ) =>
            item.id ===
              requestItem
                ?.professionalId ||
            normalize(
              item.name
            ) ===
              normalize(
                requestItem
                  ?.professionalName
              )
        ),
      [
        requestItem,
      ]
    );

  const professionalDetails =
    professional
      ? getProfessionalDetailsById(
          professional.id
        )
      : undefined;

  const existingDocument =
    useMemo(
      () =>
        getRequestedReportDocument(
          requestId,
          itemId
        ),
      [
        requestId,
        itemId,
      ]
    );

  const automaticObjectives =
    useMemo(
      () => {
        if (
          !request
        ) {
          return [];
        }

        const all =
          getObjectivesByPatientId(
            request.patientId
          );

        const byResponsible =
          all.filter(
            (
              objective
            ) => {
              const sameProfessional =
                normalize(
                  objective.professional
                ) ===
                normalize(
                  requestItem
                    ?.professionalName
                );

              const sameSpecialty =
                normalize(
                  objective.specialty
                ) ===
                normalize(
                  requestItem
                    ?.specialtyLabel
                );

              return (
                sameProfessional ||
                sameSpecialty
              );
            }
          );

        return byResponsible.length >
          0
          ? byResponsible
          : all;
      },
      [
        request,
        requestItem,
      ]
    );

  const [
    diagnosis,
    setDiagnosis,
  ] =
    useState(
      existingDocument
        ?.diagnosis ??
        ""
    );

  const [
    developmentHistory,
    setDevelopmentHistory,
  ] =
    useState(
      existingDocument
        ?.developmentHistory ??
        ""
    );

  const [
    evaluationResults,
    setEvaluationResults,
  ] =
    useState(
      existingDocument
        ?.evaluationResults ??
        ""
    );

  const [
    conclusionReferrals,
    setConclusionReferrals,
  ] =
    useState(
      existingDocument
        ?.conclusionReferrals ??
        ""
    );

  const [
    monthlyAttendanceDescription,
    setMonthlyAttendanceDescription,
  ] =
    useState(
      existingDocument
        ?.monthlyAttendanceDescription ??
        ""
    );

  const [
    monthlyContinuityJustification,
    setMonthlyContinuityJustification,
  ] =
    useState(
      existingDocument
        ?.monthlyContinuityJustification ??
        ""
    );

  const [
    monthlyPrognosis,
    setMonthlyPrognosis,
  ] =
    useState(
      existingDocument
        ?.monthlyPrognosis ??
        ""
    );

  const [
    monthlyDischargeForecastConclusion,
    setMonthlyDischargeForecastConclusion,
  ] =
    useState(
      existingDocument
        ?.monthlyDischargeForecastConclusion ??
        ""
    );

  const [
    abaPortfolioPreferredName,
    setAbaPortfolioPreferredName,
  ] =
    useState(
      existingDocument
        ?.abaPortfolioPreferredName ??
        ""
    );

  const [
    abaPortfolioAssociatedConditions,
    setAbaPortfolioAssociatedConditions,
  ] =
    useState(
      existingDocument
        ?.abaPortfolioAssociatedConditions ??
        ""
    );

  const [
    abaPortfolioMedication,
    setAbaPortfolioMedication,
  ] =
    useState(
      existingDocument
        ?.abaPortfolioMedication ??
        ""
    );

  const [
    abaPortfolioBestCommunication,
    setAbaPortfolioBestCommunication,
  ] =
    useState(
      existingDocument
        ?.abaPortfolioBestCommunication ??
        ""
    );

  const [
    abaPortfolioFavoriteActivity,
    setAbaPortfolioFavoriteActivity,
  ] =
    useState(
      existingDocument
        ?.abaPortfolioFavoriteActivity ??
        ""
    );

  const [
    abaPortfolioMonthlyGoals,
    setAbaPortfolioMonthlyGoals,
  ] =
    useState(
      existingDocument
        ?.abaPortfolioMonthlyGoals ??
        ""
    );

  const [
    abaPortfolioActivitiesPerformed,
    setAbaPortfolioActivitiesPerformed,
  ] =
    useState(
      existingDocument
        ?.abaPortfolioActivitiesPerformed ??
        ""
    );

  const [
    abaPortfolioNecessaryAdaptations,
    setAbaPortfolioNecessaryAdaptations,
  ] =
    useState(
      existingDocument
        ?.abaPortfolioNecessaryAdaptations ??
        ""
    );

  const [
    abaPortfolioFrequentResponses,
    setAbaPortfolioFrequentResponses,
  ] =
    useState(
      existingDocument
        ?.abaPortfolioFrequentResponses ??
        ""
    );

  const [
    abaPortfolioBarriers,
    setAbaPortfolioBarriers,
  ] =
    useState(
      existingDocument
        ?.abaPortfolioBarriers ??
        ""
    );

  const [
    abaPortfolioSupports,
    setAbaPortfolioSupports,
  ] =
    useState(
      existingDocument
        ?.abaPortfolioSupports ??
        ""
    );

  const [
    abaPortfolioHelpfulStrategies,
    setAbaPortfolioHelpfulStrategies,
  ] =
    useState(
      existingDocument
        ?.abaPortfolioHelpfulStrategies ??
        ""
    );

  const [
    reportDate,
    setReportDate,
  ] =
    useState(
      existingDocument
        ?.reportDate ??
        todayIso()
    );

  const [
    signatureDataUrl,
    setSignatureDataUrl,
  ] =
    useState<
      string | null
    >(
      existingDocument
        ?.signatureDataUrl ??
        null
    );

  const [
    signedAt,
    setSignedAt,
  ] =
    useState<
      string | null
    >(
      existingDocument
        ?.signedAt ??
        null
    );

  const [
    showSignature,
    setShowSignature,
  ] =
    useState(false);

  const [
    feedback,
    setFeedback,
  ] =
    useState("");

  useEffect(
    () => {
      if (
        existingDocument
      ) {
        setDiagnosis(
          existingDocument
            .diagnosis
        );

        setDevelopmentHistory(
          existingDocument
            .developmentHistory
        );

        setEvaluationResults(
          existingDocument
            .evaluationResults
        );

        setConclusionReferrals(
          existingDocument
            .conclusionReferrals
        );

        setMonthlyAttendanceDescription(
          existingDocument
            .monthlyAttendanceDescription ??
            ""
        );

        setMonthlyContinuityJustification(
          existingDocument
            .monthlyContinuityJustification ??
            ""
        );

        setMonthlyPrognosis(
          existingDocument
            .monthlyPrognosis ??
            ""
        );

        setMonthlyDischargeForecastConclusion(
          existingDocument
            .monthlyDischargeForecastConclusion ??
            ""
        );

        setAbaPortfolioPreferredName(
          existingDocument
            .abaPortfolioPreferredName ??
            ""
        );

        setAbaPortfolioAssociatedConditions(
          existingDocument
            .abaPortfolioAssociatedConditions ??
            ""
        );

        setAbaPortfolioMedication(
          existingDocument
            .abaPortfolioMedication ??
            ""
        );

        setAbaPortfolioBestCommunication(
          existingDocument
            .abaPortfolioBestCommunication ??
            ""
        );

        setAbaPortfolioFavoriteActivity(
          existingDocument
            .abaPortfolioFavoriteActivity ??
            ""
        );

        setAbaPortfolioMonthlyGoals(
          existingDocument
            .abaPortfolioMonthlyGoals ??
            ""
        );

        setAbaPortfolioActivitiesPerformed(
          existingDocument
            .abaPortfolioActivitiesPerformed ??
            ""
        );

        setAbaPortfolioNecessaryAdaptations(
          existingDocument
            .abaPortfolioNecessaryAdaptations ??
            ""
        );

        setAbaPortfolioFrequentResponses(
          existingDocument
            .abaPortfolioFrequentResponses ??
            ""
        );

        setAbaPortfolioBarriers(
          existingDocument
            .abaPortfolioBarriers ??
            ""
        );

        setAbaPortfolioSupports(
          existingDocument
            .abaPortfolioSupports ??
            ""
        );

        setAbaPortfolioHelpfulStrategies(
          existingDocument
            .abaPortfolioHelpfulStrategies ??
            ""
        );

        setReportDate(
          existingDocument
            .reportDate
        );

        setSignatureDataUrl(
          existingDocument
            .signatureDataUrl
        );

        setSignedAt(
          existingDocument
            .signedAt
        );
      }
    },
    [
      existingDocument,
    ]
  );

  if (
    !request ||
    !requestItem
  ) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <FileText
            size={34}
            className="mx-auto text-slate-400"
          />

          <h1 className="mt-4 text-lg font-bold text-slate-900">
            Solicitação não encontrada
          </h1>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/solicitacoes-relatorios"
              )
            }
            className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"
          >
            Voltar
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const isProfessional =
    user?.profile ===
    "Profissional";

  const responsibleProfessional =
    isProfessionalResponsibleForItem(
      user?.professionalName ??
        user?.name ??
        "",
      professional?.specialty ?? requestItem.specialtyLabel,
      requestItem
    );

  const editable =
    isProfessional &&
    responsibleProfessional &&
    existingDocument
      ?.status !==
      "Enviado";

  const professionalName =
    requestItem
      .professionalName ||
    professional?.name ||
    user?.professionalName ||
    user?.name ||
    "";

  const specialty =
    requestItem
      .specialtyLabel ||
    professional?.specialty ||
    "";

  const requestedReportType =
    (
      request.reportType ||
      "Relatório de acompanhamento"
    )
      .toString()
      .trim();

  const normalizedRequestedReportType =
    requestedReportType
      .replace(
        /^relatório\s+de\s+/i,
        ""
      )
      .replace(
        /^relatório\s+/i,
        ""
      )
      .replace(
        /^declaração\s+de\s+/i,
        ""
      )
      .replace(
        /^declaração\s+/i,
        ""
      )
      .trim();

  const coverTitlePrefix =
    request.reportType === "Relatório mensal" ||
    request.reportType === "Relatório de acompanhamento"
      ? "Relatório de acompanhamento"
      : /^declaração/i.test(
          requestedReportType
        )
        ? "Declaração"
        : "Relatório";

  const coverTitleMain =
    request.reportType === "Relatório mensal" ||
    request.reportType === "Relatório de acompanhamento"
      ? "da criança"
      : normalizedRequestedReportType ||
        "Acompanhamento";

  const isMonthlyReport =
    request.reportType ===
    "Relatório mensal";

  const isAbaSchoolPortfolio =
    request.reportType ===
    "Portfólio ABA escolar";

  const isTherapeuticReport =
    request.reportType ===
    "Relatório terapêutico";

  const isPsychologicalReport =
    request.reportType ===
    "Relatório psicológico";

  const isSimpleClinicalReport =
    isTherapeuticReport ||
    isPsychologicalReport;

  const registration =
    professional?.registration ||
    (
      professionalDetails
        ?.councilType &&
      professionalDetails
        ?.councilNumber
        ? `${professionalDetails.councilType} ${professionalDetails.councilNumber}`
        : professionalDetails
            ?.councilNumber ||
          ""
    );

  const city =
    patient?.cidade ||
    "Guarabira";

  const state =
    patient?.estado ||
    "PB";

  const objectiveLines =
    automaticObjectives.map(
      (
        objective
      ) =>
        objective.title
    );

  const objectiveIds =
    automaticObjectives.map(
      (
        objective
      ) =>
        objective.id
    );

  function saveDocument(
    status:
      | "Rascunho"
      | "Assinado"
      | "Enviado",
    nextSignature:
      string | null =
        signatureDataUrl,
    nextSignedAt:
      string | null =
        signedAt
  ) {
    return saveRequestedReportDocument(
      {
        requestId:
          request.id,

        itemId:
          requestItem.id,

        patientId:
          request.patientId,

        patientName:
          patient?.nome ??
          request.patientName,

        birthDate:
          patient?.nascimento ??
          "",

        responsibleName:
          patient
            ?.responsavelNome ??
          request
            .responsibleName,

        diagnosis:
          diagnosis.trim(),

        professionalName,

        specialty,

        professionalRegistration:
          registration,

        developmentHistory:
          developmentHistory.trim(),

        evaluationResults:
          evaluationResults.trim(),

        objectiveIds,

        therapeuticObjectives:
          objectiveLines,

        conclusionReferrals:
          conclusionReferrals.trim(),

        monthlyAttendanceDescription:
          monthlyAttendanceDescription.trim(),

        monthlyContinuityJustification:
          monthlyContinuityJustification.trim(),

        monthlyPrognosis:
          monthlyPrognosis.trim(),

        monthlyDischargeForecastConclusion:
          monthlyDischargeForecastConclusion.trim(),

        abaPortfolioPreferredName:
          abaPortfolioPreferredName.trim(),

        abaPortfolioAssociatedConditions:
          abaPortfolioAssociatedConditions.trim(),

        abaPortfolioMedication:
          abaPortfolioMedication.trim(),

        abaPortfolioBestCommunication:
          abaPortfolioBestCommunication.trim(),

        abaPortfolioFavoriteActivity:
          abaPortfolioFavoriteActivity.trim(),

        abaPortfolioMonthlyGoals:
          abaPortfolioMonthlyGoals.trim(),

        abaPortfolioActivitiesPerformed:
          abaPortfolioActivitiesPerformed.trim(),

        abaPortfolioNecessaryAdaptations:
          abaPortfolioNecessaryAdaptations.trim(),

        abaPortfolioFrequentResponses:
          abaPortfolioFrequentResponses.trim(),

        abaPortfolioBarriers:
          abaPortfolioBarriers.trim(),

        abaPortfolioSupports:
          abaPortfolioSupports.trim(),

        abaPortfolioHelpfulStrategies:
          abaPortfolioHelpfulStrategies.trim(),

        reportDate,

        city,

        state,

        signatureDataUrl:
          nextSignature,

        signedAt:
          nextSignedAt,

        status,

        sentAt:
          status ===
          "Enviado"
            ? new Date()
                .toISOString()
            : existingDocument
                ?.sentAt ??
              null,
      }
    );
  }

  function saveDraft() {
    saveDocument(
      signatureDataUrl
        ? "Assinado"
        : "Rascunho"
    );

    if (
      requestItem.status ===
      "Solicitado"
    ) {
      updateReportRequestItemStatus(
        request.id,
        requestItem.id,
        "Em andamento"
      );
    }

    setFeedback(
      "Rascunho salvo com sucesso."
    );
  }

  function handleSigned(
    dataUrl: string
  ) {
    const now =
      new Date()
        .toISOString();

    setSignatureDataUrl(
      dataUrl
    );

    setSignedAt(
      now
    );

    saveDocument(
      "Assinado",
      dataUrl,
      now
    );

    if (
      requestItem.status ===
      "Solicitado"
    ) {
      updateReportRequestItemStatus(
        request.id,
        requestItem.id,
        "Em andamento"
      );
    }

    setShowSignature(
      false
    );

    setFeedback(
      "Assinatura eletrônica registrada."
    );
  }

  function finalizeAndSend() {
    if (
      isAbaSchoolPortfolio
    ) {
      if (
        !abaPortfolioPreferredName
          .trim() ||
        !abaPortfolioMonthlyGoals
          .trim() ||
        !abaPortfolioActivitiesPerformed
          .trim() ||
        !abaPortfolioBarriers
          .trim() ||
        !abaPortfolioSupports
          .trim() ||
        !abaPortfolioHelpfulStrategies
          .trim()
      ) {
        window.alert(
          "Preencha pelo menos: como a criança gosta de ser chamada, metas trabalhadas no mês, atividades realizadas, barreiras, ajudas e estratégias que favorecem."
        );

        return;
      }
    } else if (
      isMonthlyReport
    ) {
      if (
        !monthlyAttendanceDescription
          .trim() ||
        !monthlyContinuityJustification
          .trim() ||
        !monthlyPrognosis
          .trim() ||
        !monthlyDischargeForecastConclusion
          .trim()
      ) {
        window.alert(
          "Preencha Descrição dos Atendimentos, Justificativa para Continuidade dos Atendimentos, Prognóstico e Previsão de Alta e Conclusão antes de finalizar."
        );

        return;
      }
    } else if (
      isSimpleClinicalReport
    ) {
      if (
        !developmentHistory
          .trim()
      ) {
        window.alert(
          `Preencha o conteúdo do ${requestedReportType.toLocaleLowerCase("pt-BR")} antes de finalizar.`
        );

        return;
      }
    } else if (
      !developmentHistory
        .trim() ||
      !evaluationResults
        .trim() ||
      !conclusionReferrals
        .trim()
    ) {
      window.alert(
        "Preencha História do Desenvolvimento, Avaliação e Resultados e Conclusão e Encaminhamentos antes de finalizar."
      );

      return;
    }

    if (
      !isAbaSchoolPortfolio &&
      !signatureDataUrl
    ) {
      window.alert(
        "Assine o relatório antes de encaminhá-lo à recepção."
      );

      return;
    }

    const confirmed =
      window.confirm(
        "Finalizar este relatório e encaminhá-lo à recepção? Após o envio, ele ficará somente para visualização."
      );

    if (
      !confirmed
    ) {
      return;
    }

    saveDocument(
      "Enviado"
    );

    updateReportRequestItemStatus(
      request.id,
      requestItem.id,
      "Entregue"
    );

    setFeedback(
      "Relatório finalizado e encaminhado à recepção."
    );

    window.setTimeout(
      () =>
        navigate(
          "/solicitacoes-relatorios"
        ),
      700
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="no-print flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:flex-row xl:items-center xl:justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/solicitacoes-relatorios"
                )
              }
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft
                size={17}
              />
              Voltar para solicitações
            </button>

            <h1 className="mt-3 text-xl font-extrabold text-[#10235f]">
              {request.reportType}
            </h1>

            <p className="mt-1 text-sm font-medium text-slate-500">
              {request.patientName} • {specialty}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                window.print()
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <Printer
                size={17}
              />
              Baixar PDF
            </button>

            {editable && (
              <>
                <button
                  type="button"
                  onClick={
                    saveDraft
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-[#dcd6ff] bg-[#f8f6ff] px-4 py-2.5 text-sm font-bold text-[#6543ef] hover:bg-[#f1edff]"
                >
                  <Save
                    size={17}
                  />
                  Salvar rascunho
                </button>

                {!isAbaSchoolPortfolio && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowSignature(
                        true
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-bold text-sky-700 hover:bg-sky-100"
                  >
                    <PenLine
                      size={17}
                    />
                    {signatureDataUrl
                      ? "Refazer assinatura"
                      : "Assinar eletronicamente"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={
                    finalizeAndSend
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5d3df5] via-[#7046ff] to-[#8238ff] px-4 py-2.5 text-sm font-bold text-white shadow-sm"
                >
                  <Send
                    size={17}
                  />
                  Finalizar e encaminhar
                </button>
              </>
            )}
          </div>
        </div>

        {feedback && (
          <div className="no-print flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <CheckCircle2
              size={18}
            />
            {feedback}
          </div>
        )}

        {!editable &&
          existingDocument
            ?.status ===
            "Enviado" && (
            <div className="no-print rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              Documento finalizado e encaminhado à recepção em{" "}
              {existingDocument.sentAt
                ? new Intl.DateTimeFormat(
                    "pt-BR",
                    {
                      dateStyle:
                        "short",
                      timeStyle:
                        "short",
                    }
                  ).format(
                    new Date(
                      existingDocument
                        .sentAt
                    )
                  )
                : "-"}
              .
            </div>
          )}

        <div className="report-print-area space-y-6">
          {/* CAPA */}

          {!isSimpleClinicalReport && (
            isAbaSchoolPortfolio ? (
              <article className="report-page report-cover mx-auto overflow-hidden bg-white shadow-xl">
                <img
                  src={
                    abaPortfolioCover
                  }
                  alt="Portfólio ABA da Criança e do Adolescente na Escola"
                  className="h-full w-full object-fill"
                />
              </article>
            ) : (
              <article className="report-page report-cover report-letterhead-page mx-auto overflow-hidden bg-white shadow-xl">
                <img
                  src={
                    reportLetterhead
                  }
                  alt=""
                  aria-hidden="true"
                  className="report-letterhead-background"
                />

                <div className="report-cover-title">
                  <p className="report-cover-title-line">
                    {coverTitlePrefix}
                  </p>

                  <p className="report-cover-title-main">
                    {coverTitleMain}
                  </p>
                </div>
              </article>
            )
          )}

          {/* CONTEÚDO */}

          {isAbaSchoolPortfolio ? (
            <>
              <article className="report-page aba-portfolio-page mx-auto overflow-hidden bg-white shadow-xl">
                <img
                  src={abaPortfolioLetterhead}
                  alt=""
                  aria-hidden="true"
                  className="report-letterhead-background"
                />

                <div className="aba-portfolio-content aba-portfolio-intro">
                  <p>
                    Olá, tudo bem?
                  </p>

                  <p>
                    Meu nome é <strong>{patient?.nome ?? request.patientName}</strong><br />
                    e eu sou uma criança com <strong>{diagnosis || "________________"}</strong>.
                  </p>

                  <p>
                    O diagnóstico faz parte de quem eu sou e influencia o meu jeito de aprender, me comunicar e me relacionar.
                  </p>

                  <p>
                    Eu não preciso que me consertem, mas que me compreendam.
                  </p>

                  <p>
                    Quando todos os envolvidos acreditam em mim, eu aprendo e participo muito melhor!
                  </p>

                  {editable && (
                    <div className="no-print mt-8 rounded-xl border border-sky-100 bg-white/90 p-4">
                      <label className="text-xs font-bold text-slate-600">
                        Diagnóstico usado nesta página
                      </label>
                      <input
                        value={diagnosis}
                        onChange={(event) =>
                          setDiagnosis(event.target.value)
                        }
                        placeholder="Informe o diagnóstico"
                        className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                  )}
                </div>
              </article>

              <article className="report-page aba-portfolio-page mx-auto overflow-hidden bg-white shadow-xl">
                <img
                  src={abaPortfolioLetterhead}
                  alt=""
                  aria-hidden="true"
                  className="report-letterhead-background"
                />

                <div className="aba-portfolio-content">
                  <PortfolioTitle tone="peach">
                    SOBRE MIM
                  </PortfolioTitle>

                  <PortfolioTextField
                    label="Gosto de ser chamado(a) de:"
                    value={abaPortfolioPreferredName}
                    onChange={setAbaPortfolioPreferredName}
                    editable={editable}
                    tone="peach"
                  />

                  <PortfolioTextField
                    label="Tenho outras condições associadas?"
                    value={abaPortfolioAssociatedConditions}
                    onChange={setAbaPortfolioAssociatedConditions}
                    editable={editable}
                    tone="peach"
                  />

                  <PortfolioTextField
                    label="Usei medicação nos últimos meses?"
                    value={abaPortfolioMedication}
                    onChange={setAbaPortfolioMedication}
                    editable={editable}
                    tone="peach"
                  />

                  <PortfolioTextField
                    label="Qual foi a minha melhor forma de comunicação:"
                    value={abaPortfolioBestCommunication}
                    onChange={setAbaPortfolioBestCommunication}
                    editable={editable}
                    tone="peach"
                  />

                  <PortfolioTextField
                    label="Meu brinquedo/brincadeira favorita é:"
                    value={abaPortfolioFavoriteActivity}
                    onChange={setAbaPortfolioFavoriteActivity}
                    editable={editable}
                    tone="peach"
                  />
                </div>
              </article>

              <article className="report-page aba-portfolio-page mx-auto overflow-hidden bg-white shadow-xl">
                <img
                  src={abaPortfolioLetterhead}
                  alt=""
                  aria-hidden="true"
                  className="report-letterhead-background"
                />

                <div className="aba-portfolio-content">
                  <PortfolioTitle tone="green">
                    ATENDIMENTOS E CUIDADOS
                  </PortfolioTitle>

                  <PortfolioTextField
                    label="Metas trabalhadas no mês:"
                    value={abaPortfolioMonthlyGoals}
                    onChange={setAbaPortfolioMonthlyGoals}
                    editable={editable}
                    tone="orange"
                    rows={4}
                  />

                  <PortfolioTextField
                    label="Atividades realizadas:"
                    value={abaPortfolioActivitiesPerformed}
                    onChange={setAbaPortfolioActivitiesPerformed}
                    editable={editable}
                    tone="orange"
                    rows={4}
                  />

                  <PortfolioTextField
                    label="Adaptações necessárias:"
                    value={abaPortfolioNecessaryAdaptations}
                    onChange={setAbaPortfolioNecessaryAdaptations}
                    editable={editable}
                    tone="orange"
                    rows={4}
                  />

                  <PortfolioTextField
                    label="Respostas mais frequentes às demandas:"
                    value={abaPortfolioFrequentResponses}
                    onChange={setAbaPortfolioFrequentResponses}
                    editable={editable}
                    tone="orange"
                    rows={4}
                  />
                </div>
              </article>

              <article className="report-page aba-portfolio-page mx-auto overflow-hidden bg-white shadow-xl">
                <img
                  src={abaPortfolioLetterhead}
                  alt=""
                  aria-hidden="true"
                  className="report-letterhead-background"
                />

                <div className="aba-portfolio-content">
                  <PortfolioTitle tone="purple">
                    PONTOS FORTES E FRACOS
                  </PortfolioTitle>

                  <PortfolioTextField
                    label="Barreiras:"
                    value={abaPortfolioBarriers}
                    onChange={setAbaPortfolioBarriers}
                    editable={editable}
                    tone="purple"
                    rows={5}
                  />

                  <PortfolioTextField
                    label="Ajudas:"
                    value={abaPortfolioSupports}
                    onChange={setAbaPortfolioSupports}
                    editable={editable}
                    tone="purple"
                    rows={5}
                  />

                  <PortfolioTextField
                    label="Estratégias que favorecem:"
                    value={abaPortfolioHelpfulStrategies}
                    onChange={setAbaPortfolioHelpfulStrategies}
                    editable={editable}
                    tone="purple"
                    rows={5}
                  />
                </div>
              </article>
            </>
          ) : isSimpleClinicalReport ? (
            <article className="report-page report-letterhead-page mx-auto overflow-hidden bg-white shadow-xl">
              <img
                src={reportLetterhead}
                alt=""
                aria-hidden="true"
                className="report-letterhead-background"
              />

              <div className="simple-clinical-content report-content-on-letterhead">
                <h2 className="simple-clinical-title">
                  {requestedReportType}
                </h2>

                <div className="simple-clinical-identification">
                  <p>
                    <strong>CRIANÇA:</strong>{" "}
                    {patient?.nome ?? request.patientName}
                  </p>
                  <p>
                    <strong>DATA DE NASCIMENTO:</strong>{" "}
                    {formatDate(patient?.nascimento ?? "") || "-"}
                    {calculateAge(patient?.nascimento ?? "")
                      ? ` • ${calculateAge(patient?.nascimento ?? "")}`
                      : ""}
                  </p>
                  <p>
                    <strong>PROFISSIONAL:</strong>{" "}
                    {professionalName}
                    {specialty ? ` • ${specialty}` : ""}
                  </p>
                </div>

                {editable ? (
                  <textarea
                    value={developmentHistory}
                    onChange={(event) => setDevelopmentHistory(event.target.value)}
                    placeholder={`Escreva aqui o conteúdo do ${requestedReportType.toLocaleLowerCase("pt-BR")}...`}
                    className="simple-clinical-editor no-print-adjust"
                  />
                ) : (
                  <div className="simple-clinical-text">
                    {developmentHistory || "Não informado."}
                  </div>
                )}

                <div className="simple-clinical-footer">
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900">
                      {city}/{state}, {formatLongDate(reportDate)}
                    </p>

                    {editable && (
                      <input
                        type="date"
                        value={reportDate}
                        onChange={(event) => setReportDate(event.target.value)}
                        className="no-print mt-2 rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      />
                    )}
                  </div>

                  <div className="simple-clinical-signature">
                    {signatureDataUrl ? (
                      <img
                        src={signatureDataUrl}
                        alt="Assinatura eletrônica"
                        className="mx-auto h-[62px] max-w-[250px] object-contain"
                      />
                    ) : (
                      <div className="mx-auto h-[62px] w-[250px]" />
                    )}
                    <div className="mx-auto w-[250px] border-t border-slate-900" />
                    <p className="mt-1 text-sm font-extrabold text-slate-900">
                      {professionalName}
                    </p>
                    <p className="text-xs font-semibold text-slate-700">
                      {professionLabel(specialty)}
                      {registration ? ` • ${registration}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ) : isMonthlyReport ? (
            <article className="report-page report-letterhead-page mx-auto overflow-hidden bg-white shadow-xl">
              <img
                src={
                  reportLetterhead
                }
                alt=""
                aria-hidden="true"
                className="report-letterhead-background"
              />

              <div className="report-content report-content-on-letterhead">
                <SectionTitle>
                  DADOS DE IDENTIFICAÇÃO DA CRIANÇA
                </SectionTitle>

                <div className="report-identification">
                  <InfoRow
                    label="NOME"
                    value={
                      patient?.nome ??
                      request.patientName
                    }
                  />

                  <div className="report-info-date-row">
                    <strong className="report-info-label">
                      DATA DE NASCIMENTO
                    </strong>

                    <span className="report-info-value">
                      {formatDate(
                        patient?.nascimento ??
                          ""
                      ) || "-"}
                    </span>

                    <strong className="report-info-date-age-label">
                      IDADE
                    </strong>

                    <span className="report-info-date-age-value">
                      {calculateAge(
                        patient?.nascimento ??
                          ""
                      ) || "-"}
                    </span>
                  </div>

                  <InfoRow
                    label="RESPONSÁVEIS"
                    value={
                      patient
                        ?.responsavelNome ??
                      request
                        .responsibleName
                    }
                  />

                  <div className="report-info-row">
                    <strong className="report-info-label">
                      DIAGNÓSTICO
                    </strong>

                    {editable ? (
                      <input
                        value={
                          diagnosis
                        }
                        onChange={(
                          event
                        ) =>
                          setDiagnosis(
                            event.target.value
                          )
                        }
                        placeholder="Informe o diagnóstico, se aplicável"
                        className="report-inline-input"
                      />
                    ) : (
                      <span className="report-info-value">
                        {existingDocument
                          ?.diagnosis ||
                          diagnosis ||
                          "-"}
                      </span>
                    )}
                  </div>

                  <InfoRow
                    label="PROFISSIONAL"
                    value={
                      professionalName
                    }
                  />

                  <InfoRow
                    label="ESPECIALIDADE"
                    value={
                      specialty
                    }
                  />
                </div>

                <SectionTitle>
                  DESCRIÇÃO DOS ATENDIMENTOS
                </SectionTitle>

                <ReportTextField
                  value={
                    monthlyAttendanceDescription
                  }
                  onChange={
                    setMonthlyAttendanceDescription
                  }
                  editable={
                    editable
                  }
                  placeholder="Escreva de forma resumida, mas clara, os objetivos trabalhados durante o mês com a criança e os resultados. Relate as dificuldades da criança para justificar a não conquista de objetivos, quando necessário."
                  minHeight="145px"
                />

                <SectionTitle>
                  JUSTIFICATIVA PARA CONTINUIDADE DOS ATENDIMENTOS
                </SectionTitle>

                <ReportTextField
                  value={
                    monthlyContinuityJustification
                  }
                  onChange={
                    setMonthlyContinuityJustification
                  }
                  editable={
                    editable
                  }
                  placeholder="Relate as necessidades da criança e os motivos pelos quais ela precisa continuar em atendimento."
                  minHeight="120px"
                />

                <SectionTitle>
                  PROGNÓSTICO
                </SectionTitle>

                <ReportTextField
                  value={
                    monthlyPrognosis
                  }
                  onChange={
                    setMonthlyPrognosis
                  }
                  editable={
                    editable
                  }
                  placeholder="Descreva os objetivos para o próximo mês e os resultados esperados da criança a curto prazo."
                  minHeight="120px"
                />

                <SectionTitle>
                  PREVISÃO DE ALTA E CONCLUSÃO
                </SectionTitle>

                <ReportTextField
                  value={
                    monthlyDischargeForecastConclusion
                  }
                  onChange={
                    setMonthlyDischargeForecastConclusion
                  }
                  editable={
                    editable
                  }
                  placeholder="Apresente suas percepções e justificativas."
                  minHeight="120px"
                />

                <div className="mt-8 flex justify-end">
                  <div className="min-w-[340px] text-center">
                    <p className="text-base font-bold text-slate-900">
                      {city}/{state},{" "}
                      {formatLongDate(
                        reportDate
                      )}
                    </p>

                    {editable && (
                      <div className="no-print mt-2">
                        <input
                          type="date"
                          value={
                            reportDate
                          }
                          onChange={(
                            event
                          ) =>
                            setReportDate(
                              event.target.value
                            )
                          }
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-7 flex justify-start">
                  <div className="w-[360px] text-center">
                    {signatureDataUrl ? (
                      <img
                        src={
                          signatureDataUrl
                        }
                        alt="Assinatura eletrônica"
                        className="mx-auto h-[80px] max-w-[280px] object-contain"
                      />
                    ) : (
                      <div className="mx-auto h-[80px] w-[280px]" />
                    )}

                    <div className="mx-auto w-[280px] border-t border-slate-900" />

                    <p className="mt-2 text-base font-extrabold text-slate-900">
                      {
                        professionalName
                      }
                    </p>

                    <p className="text-sm font-semibold text-slate-800">
                      {professionLabel(
                        specialty
                      )}
                    </p>

                    {registration && (
                      <p className="text-sm font-semibold text-slate-800">
                        {
                          registration
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ) : (
            <>
          <article className="report-page report-letterhead-page mx-auto overflow-hidden bg-white shadow-xl">
            <img
              src={
                reportLetterhead
              }
              alt=""
              aria-hidden="true"
              className="report-letterhead-background"
            />

            <div className="report-content report-content-on-letterhead">
              <SectionTitle>
                DADOS DE IDENTIFICAÇÃO DA CRIANÇA
              </SectionTitle>

              <div className="report-identification">
                <InfoRow
                  label="NOME"
                  value={
                    patient?.nome ??
                    request.patientName
                  }
                />

                <div className="report-info-date-row">
                  <strong className="report-info-label">
                    DATA DE NASCIMENTO
                  </strong>

                  <span className="report-info-value">
                    {formatDate(
                      patient?.nascimento ??
                        ""
                    ) || "-"}
                  </span>

                  <strong className="report-info-date-age-label">
                    IDADE
                  </strong>

                  <span className="report-info-date-age-value">
                    {calculateAge(
                      patient?.nascimento ??
                        ""
                    ) || "-"}
                  </span>
                </div>

                <InfoRow
                  label="RESPONSÁVEIS"
                  value={
                    patient
                      ?.responsavelNome ??
                    request
                      .responsibleName
                  }
                />

                <div className="report-info-row">
                  <strong className="report-info-label">
                    DIAGNÓSTICO
                  </strong>

                  {editable ? (
                    <input
                      value={
                        diagnosis
                      }
                      onChange={(
                        event
                      ) =>
                        setDiagnosis(
                          event.target.value
                        )
                      }
                      placeholder="Informe o diagnóstico, se aplicável"
                      className="report-inline-input"
                    />
                  ) : (
                    <span className="report-info-value">
                      {existingDocument
                        ?.diagnosis ||
                        diagnosis ||
                        "-"}
                    </span>
                  )}
                </div>

                <InfoRow
                  label="PROFISSIONAL"
                  value={
                    professionalName
                  }
                />

                <InfoRow
                  label="ESPECIALIDADE"
                  value={
                    specialty
                  }
                />
              </div>

              <SectionTitle>
                HISTÓRIA DO DESENVOLVIMENTO/ DESCRIÇÃO DO CASO
              </SectionTitle>

              <ReportTextField
                value={
                  developmentHistory
                }
                onChange={
                  setDevelopmentHistory
                }
                editable={
                  editable
                }
                placeholder="Descreva a história do desenvolvimento e o caso clínico..."
              />

              <SectionTitle>
                AVALIAÇÃO E RESULTADOS
              </SectionTitle>

              <ReportTextField
                value={
                  evaluationResults
                }
                onChange={
                  setEvaluationResults
                }
                editable={
                  editable
                }
                placeholder="Descreva os instrumentos, procedimentos de avaliação e os resultados encontrados..."
              />
            </div>

          </article>

          <article className="report-page report-letterhead-page mx-auto overflow-hidden bg-white shadow-xl">
            <img
              src={
                reportLetterhead
              }
              alt=""
              aria-hidden="true"
              className="report-letterhead-background"
            />

            <div className="report-content report-content-on-letterhead">
              <SectionTitle>
                OBJETIVOS TERAPÊUTICOS
              </SectionTitle>

              <div className="report-box">
                {objectiveLines.length >
                0 ? (
                  <div className="space-y-3">
                    {automaticObjectives.map(
                      (
                        objective
                      ) => (
                        <div
                          key={
                            objective.id
                          }
                          className="text-[15px] leading-7 text-slate-900"
                        >
                          <span className="font-bold">
                            -{" "}
                          </span>

                          {
                            objective.title
                          }

                          {objective
                            .generalObjective && (
                            <span className="ml-2 text-xs italic text-slate-500">
                              (
                              {
                                objective.generalObjective
                              }
                              )
                            </span>
                          )}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm italic text-slate-400">
                    Nenhum objetivo terapêutico foi encontrado para este paciente/profissional.
                  </p>
                )}
              </div>

              <SectionTitle>
                CONCLUSÃO E ENCAMINHAMENTOS
              </SectionTitle>

              <ReportTextField
                value={
                  conclusionReferrals
                }
                onChange={
                  setConclusionReferrals
                }
                editable={
                  editable
                }
                placeholder="Registre a conclusão clínica, orientações e encaminhamentos..."
              />

              <div className="mt-10 flex justify-end">
                <div className="min-w-[340px] text-center">
                  <p className="text-base font-bold text-slate-900">
                    {city}/{state},{" "}
                    {formatLongDate(
                      reportDate
                    )}
                  </p>

                  {editable && (
                    <div className="no-print mt-2">
                      <input
                        type="date"
                        value={
                          reportDate
                        }
                        onChange={(
                          event
                        ) =>
                          setReportDate(
                            event.target.value
                          )
                        }
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-start">
                <div className="w-[360px] text-center">
                  {signatureDataUrl ? (
                    <img
                      src={
                        signatureDataUrl
                      }
                      alt="Assinatura eletrônica"
                      className="mx-auto h-[90px] max-w-[280px] object-contain"
                    />
                  ) : (
                    <div className="mx-auto h-[90px] w-[280px]" />
                  )}

                  <div className="mx-auto w-[280px] border-t border-slate-900" />

                  <p className="mt-2 text-base font-extrabold text-slate-900">
                    {
                      professionalName
                    }
                  </p>

                  <p className="text-sm font-semibold text-slate-800">
                    {professionLabel(
                      specialty
                    )}
                  </p>

                  {registration && (
                    <p className="text-sm font-semibold text-slate-800">
                      {
                        registration
                      }
                    </p>
                  )}

                  {signedAt && (
                    <p className="mt-2 text-[10px] font-medium text-slate-400">
                      Assinatura eletrônica registrada em{" "}
                      {new Intl.DateTimeFormat(
                        "pt-BR",
                        {
                          dateStyle:
                            "short",
                          timeStyle:
                            "short",
                        }
                      ).format(
                        new Date(
                          signedAt
                        )
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

          </article>
            </>
          )}
        </div>

        {showSignature && (
          <SignatureModal
            professionalName={
              professionalName
            }
            registration={
              registration
            }
            onClose={() =>
              setShowSignature(
                false
              )
            }
            onConfirm={
              handleSigned
            }
          />
        )}

        <style>{`
          .report-page {
            width: 794px;
            min-height: 1123px;
            position: relative;
            color: #111827;
          }

          .report-letterhead-page {
            isolation: isolate;
            background: #ffffff;
          }

          .report-letterhead-background {
            position: absolute;
            inset: 0;
            z-index: 0;
            width: 100%;
            height: 100%;
            object-fit: fill;
            pointer-events: none;
            user-select: none;
          }

          .report-content-on-letterhead {
            position: relative;
            z-index: 1;
          }

          .report-cover {
            position: relative;
            z-index: 1;
            height: 1123px;
          }

          .report-cover-title {
            position: absolute;
            z-index: 2;
            top: 245px;
            left: 0;
            width: 84%;
            padding: 30px 54px 32px 54px;
            text-align: left;
            background: #42a8d1;
          }

          .report-cover-title-line {
            margin: 0;
            color: #ffffff;
            font-size: 30px;
            font-weight: 300;
            line-height: 1.08;
            letter-spacing: 0.02em;
            text-transform: uppercase;
          }

          .report-cover-title-main {
            margin: 4px 0;
            color: #ffffff;
            font-size: 40px;
            font-weight: 800;
            line-height: 1.02;
            text-transform: uppercase;
            overflow-wrap: anywhere;
          }

          .simple-clinical-content {
            position: relative;
            z-index: 1;
            display: flex;
            min-height: 1123px;
            flex-direction: column;
            padding: 112px 86px 118px;
            box-sizing: border-box;
          }

          .simple-clinical-title {
            margin: 0 0 18px;
            color: #126b9a;
            font-size: 25px;
            font-weight: 800;
            line-height: 1.15;
            text-align: center;
            text-transform: uppercase;
          }

          .simple-clinical-identification {
            margin-bottom: 18px;
            border-top: 1px solid #94a3b8;
            border-bottom: 1px solid #94a3b8;
            padding: 10px 4px;
            color: #334155;
            font-size: 12px;
            line-height: 1.65;
          }

          .simple-clinical-editor,
          .simple-clinical-text {
            width: 100%;
            height: 525px;
            min-height: 525px;
            box-sizing: border-box;
            border: 1px solid #94a3b8;
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.86);
            padding: 16px;
            color: #1f2937;
            font-family: inherit;
            font-size: 14px;
            line-height: 1.65;
            overflow-wrap: anywhere;
            white-space: pre-wrap;
          }

          .simple-clinical-editor {
            resize: none;
            outline: none;
          }

          .simple-clinical-editor:focus {
            border-color: #2f8dbd;
            box-shadow: 0 0 0 3px rgba(47, 141, 189, 0.14);
          }

          .simple-clinical-footer {
            margin-top: 20px;
          }

          .simple-clinical-signature {
            margin-top: 14px;
            width: 330px;
            text-align: center;
          }

          .report-content {
            padding: 36px 92px 110px 92px;
          }

          .report-letterhead-page .report-content {
            padding:
              150px
              86px
              150px
              86px;
          }

          .report-cover > *:not(.report-letterhead-background) {
            position: relative;
            z-index: 1;
          }

          .report-identification {
            border: 1px solid #111827;
            margin-bottom: 28px;
          }

          .report-info-row {
            display: grid;
            grid-template-columns: 160px minmax(0, 1fr);
            border-bottom: 1px solid #111827;
            min-height: 38px;
          }

          .report-info-row:last-child {
            border-bottom: 0;
          }

          .report-info-date-row {
            display: grid;
            grid-template-columns:
              160px
              minmax(0, 1fr)
              145px
              72px;
            min-height: 38px;
            border-bottom: 1px solid #111827;
          }

          .report-info-label {
            display: flex;
            align-items: center;
            padding: 6px 8px;
            border-right: 1px solid #111827;
            font-size: 13px;
            line-height: 1.15;
            font-weight: 800;
          }

          .report-info-value {
            display: flex;
            align-items: center;
            min-width: 0;
            padding: 6px 8px;
            font-size: 13px;
            line-height: 1.2;
          }

          .report-info-date-age-label {
            display: flex;
            align-items: center;
            padding: 6px 8px;
            border-left: 1px solid #111827;
            border-right: 1px solid #111827;
            font-size: 13px;
            line-height: 1.15;
            font-weight: 800;
          }

          .report-info-date-age-value {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 6px 6px;
            font-size: 13px;
            line-height: 1.2;
            white-space: nowrap;
          }

          .report-inline-input {
            width: 100%;
            min-width: 0;
            border: 0;
            outline: 0;
            padding: 6px 8px;
            font-size: 13px;
            line-height: 1.2;
            background: #fffdf7;
          }

          .report-box {
            width: 100%;
            height: auto;
            min-height: 0;
            border: 1px solid #111827;
            padding: 10px;
            font-size: 15px;
            line-height: 1.55;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
            box-sizing: border-box;
          }

          .report-editor {
            display: block;
            width: 100%;
            height: auto;
            min-height: 52px;
            overflow: hidden;
            resize: none;
            border: 1px solid #111827;
            padding: 10px;
            font-size: 15px;
            line-height: 1.55;
            outline: 0;
            background: #fffdf7;
            box-sizing: border-box;
          }


          .aba-portfolio-page {
            isolation: isolate;
            background: #ffffff;
          }

          .aba-portfolio-content {
            position: relative;
            z-index: 1;
            padding: 145px 86px 125px 86px;
          }

          .aba-portfolio-intro {
            padding-top: 150px;
            font-size: 28px;
            line-height: 1.6;
            font-weight: 600;
            color: #4d4d4d;
          }

          .aba-portfolio-intro p {
            margin-bottom: 18px;
          }

          .portfolio-field-input,
          .portfolio-field-value {
            width: 100%;
            box-sizing: border-box;
            border: 3px dotted;
            background: rgba(255, 255, 255, 0.60);
            padding: 8px 14px;
            font-size: 15px;
            line-height: 1.45;
            color: #374151;
            outline: none;
          }

          .portfolio-field-input {
            min-height: 42px;
            height: 42px;
            resize: none;
            overflow: hidden;
          }

          .portfolio-field-value {
            min-height: 42px;
            white-space: pre-wrap;
          }

          @media print {
            @page {
              size: A4;
              margin: 0;
            }

            body {
              background: white !important;
            }

            body * {
              visibility: hidden !important;
            }

            .report-print-area,
            .report-print-area * {
              visibility: visible !important;
            }

            .report-print-area {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              margin: 0 !important;
            }

            .report-page {
              width: 210mm !important;
              min-height: 297mm !important;
              height: 297mm !important;
              margin: 0 !important;
              box-shadow: none !important;
              page-break-after: always;
              break-after: page;
              overflow: hidden !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .report-letterhead-background {
              display: block !important;
              visibility: visible !important;
              width: 210mm !important;
              height: 297mm !important;
              object-fit: fill !important;
            }

            .report-page:last-child {
              page-break-after: auto;
            }

            .no-print {
              display: none !important;
            }

            .report-inline-input,
            .report-editor {
              background: white !important;
            }

            textarea {
              height: auto !important;
              min-height: 0 !important;
              overflow: visible !important;
              resize: none !important;
            }

            .report-box,
            .report-editor {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}

function SectionTitle({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div className="mb-3 mt-7 flex min-h-[36px] items-center justify-center bg-[#7bb4e6] px-4 py-2 text-center text-[17px] font-black uppercase leading-none tracking-[0.01em] text-white">
      {children}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label:
    string;
  value:
    string;
}) {
  return (
    <div className="report-info-row">
      <strong className="report-info-label">
        {label}
      </strong>

      <span className="report-info-value">
        {value || "-"}
      </span>
    </div>
  );
}

function ReportTextField({
  value,
  onChange,
  editable,
  placeholder,
  minHeight,
}: {
  value:
    string;
  onChange:
    (value: string) =>
      void;
  editable:
    boolean;
  placeholder:
    string;
  minHeight?:
    string;
}) {
  const textareaRef =
    useRef<HTMLTextAreaElement | null>(
      null
    );

  function resizeTextarea() {
    const textarea =
      textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height =
      "auto";

    textarea.style.height =
      `${Math.max(
        textarea.scrollHeight,
        52
      )}px`;
  }

  useEffect(
    () => {
      resizeTextarea();
    },
    [
      value,
      editable,
    ]
  );

  if (
    editable
  ) {
    return (
      <textarea
        ref={
          textareaRef
        }
        value={
          value
        }
        onChange={(
          event
        ) => {
          onChange(
            event.target.value
          );

          requestAnimationFrame(
            resizeTextarea
          );
        }}
        onInput={
          resizeTextarea
        }
        placeholder={
          placeholder
        }
        rows={
          1
        }
        className="report-editor"
        style={{ minHeight }}
      />
    );
  }

  return (
    <div className="report-box" style={{ minHeight }}>
      {value ||
        "Não informado."}
    </div>
  );
}

function SignatureModal({
  professionalName,
  registration,
  onClose,
  onConfirm,
}: {
  professionalName:
    string;
  registration:
    string;
  onClose:
    () => void;
  onConfirm:
    (dataUrl: string) =>
      void;
}) {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const drawingRef =
    useRef(false);

  const hasDrawingRef =
    useRef(false);

  useEffect(
    () => {
      const canvas =
        canvasRef.current;

      if (!canvas) {
        return;
      }

      const context =
        canvas.getContext(
          "2d"
        );

      if (!context) {
        return;
      }

      context.lineWidth =
        2.2;

      context.lineCap =
        "round";

      context.lineJoin =
        "round";

      context.strokeStyle =
        "#172554";
    },
    []
  );

  function pointFromEvent(
    event:
      ReactPointerEvent<HTMLCanvasElement>
  ) {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return {
        x: 0,
        y: 0,
      };
    }

    const rect =
      canvas.getBoundingClientRect();

    return {
      x:
        (
          event.clientX -
          rect.left
        ) *
        (
          canvas.width /
          rect.width
        ),

      y:
        (
          event.clientY -
          rect.top
        ) *
        (
          canvas.height /
          rect.height
        ),
    };
  }

  function startDrawing(
    event:
      ReactPointerEvent<HTMLCanvasElement>
  ) {
    const canvas =
      canvasRef.current;

    const context =
      canvas?.getContext(
        "2d"
      );

    if (
      !canvas ||
      !context
    ) {
      return;
    }

    drawingRef.current =
      true;

    hasDrawingRef.current =
      true;

    canvas.setPointerCapture(
      event.pointerId
    );

    const point =
      pointFromEvent(
        event
      );

    context.beginPath();

    context.moveTo(
      point.x,
      point.y
    );
  }

  function draw(
    event:
      ReactPointerEvent<HTMLCanvasElement>
  ) {
    if (
      !drawingRef.current
    ) {
      return;
    }

    const context =
      canvasRef.current
        ?.getContext(
          "2d"
        );

    if (!context) {
      return;
    }

    const point =
      pointFromEvent(
        event
      );

    context.lineTo(
      point.x,
      point.y
    );

    context.stroke();
  }

  function stopDrawing() {
    drawingRef.current =
      false;
  }

  function clearSignature() {
    const canvas =
      canvasRef.current;

    const context =
      canvas?.getContext(
        "2d"
      );

    if (
      !canvas ||
      !context
    ) {
      return;
    }

    context.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    hasDrawingRef.current =
      false;
  }

  function confirmSignature() {
    const canvas =
      canvasRef.current;

    if (
      !canvas ||
      !hasDrawingRef.current
    ) {
      window.alert(
        "Desenhe sua assinatura antes de confirmar."
      );

      return;
    }

    onConfirm(
      canvas.toDataURL(
        "image/png"
      )
    );
  }

  return (
    <div className="no-print fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-extrabold text-[#10235f]">
              Assinatura eletrônica
            </h2>

            <p className="mt-1 text-xs font-medium text-slate-500">
              {professionalName}
              {registration
                ? ` • ${registration}`
                : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X
              size={20}
            />
          </button>
        </div>

        <div className="p-6">
          <p className="mb-3 text-sm font-semibold text-slate-700">
            Assine no quadro abaixo usando o mouse ou toque:
          </p>

          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-2">
            <canvas
              ref={
                canvasRef
              }
              width={
                900
              }
              height={
                260
              }
              onPointerDown={
                startDrawing
              }
              onPointerMove={
                draw
              }
              onPointerUp={
                stopDrawing
              }
              onPointerCancel={
                stopDrawing
              }
              onPointerLeave={
                stopDrawing
              }
              className="h-[180px] w-full touch-none cursor-crosshair rounded-lg bg-white"
            />
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            Esta assinatura é registrada eletronicamente dentro do sistema, junto com o profissional e a data/hora da assinatura.
          </p>

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={
                clearSignature
              }
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Limpar
            </button>

            <button
              type="button"
              onClick={
                onClose
              }
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={
                confirmSignature
              }
              className="rounded-xl bg-[#6847f5] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#5b3de3]"
            >
              Confirmar assinatura
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
