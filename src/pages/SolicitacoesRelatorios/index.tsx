import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock3,
  FileCheck2,
  FileText,
  Plus,
  Search,
  Send,
  UserRound,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { getPatients } from "@/pages/Pacientes/patientStorage";
import { getProfessionalSpecialty } from "@/pages/Pacientes/patientAccessRules";
import { getActiveProfessionals } from "@/pages/Configuracoes/settingsStorage";

import {
  REPORT_REQUESTS_CHANGED_EVENT,
  REPORT_REQUEST_SPECIALTIES,
  calculateBusinessDeadline,
  createReportRequest,
  getReportItemDisplayStatus,
  getReportRequests,
  isProfessionalResponsibleForItem,
  updateReportRequestItemStatus,
  type ReportRequest,
  type ReportRequestDisplayStatus,
  type ReportRequestItem,
  type ReportRequestStatus,
  type ReportSpecialtyKey,
} from "./reportRequestStorage";

import {
  getRequestedReportDocument,
} from "./reportDocumentStorage";

interface SelectedSpecialty {
  selected: boolean;
  professionalId: number | null;
  professionalName: string;
}

type SpecialtySelectionState = Record<
  ReportSpecialtyKey,
  SelectedSpecialty
>;

function todayIsoDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

function formatDate(date: string) {
  if (!date) {
    return "-";
  }

  const [year, month, day] = date.split("-");

  return `${day}/${month}/${year}`;
}

function formatDateTime(date: string | null) {
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

function createEmptySpecialties(): SpecialtySelectionState {
  return REPORT_REQUEST_SPECIALTIES.reduce(
    (accumulator, specialty) => {
      accumulator[specialty.key] = {
        selected: false,
        professionalId: null,
        professionalName: "",
      };

      return accumulator;
    },
    {} as SpecialtySelectionState
  );
}

export default function SolicitacoesRelatorios() {
  const { user } = useAuth();

  const [requests, setRequests] = useState<ReportRequest[]>(() =>
    getReportRequests()
  );

  const [search, setSearch] = useState("");
  const [showNewRequest, setShowNewRequest] = useState(false);

  function refreshRequests() {
    setRequests(getReportRequests());
  }

  useEffect(() => {
    window.addEventListener(
      REPORT_REQUESTS_CHANGED_EVENT,
      refreshRequests
    );

    window.addEventListener("storage", refreshRequests);

    return () => {
      window.removeEventListener(
        REPORT_REQUESTS_CHANGED_EVENT,
        refreshRequests
      );

      window.removeEventListener("storage", refreshRequests);
    };
  }, []);

  const isReception = user?.profile === "Recepção";
  const isProfessional = user?.profile === "Profissional";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          profile={user?.profile ?? ""}
          onNewRequest={
            isReception
              ? () => setShowNewRequest(true)
              : undefined
          }
        />

        {isProfessional ? (
          <ProfessionalView
            requests={requests}
            search={search}
            onSearchChange={setSearch}
            professionalName={
              user?.professionalName ?? user?.name ?? ""
            }
          />
        ) : (
          <ManagementView
            requests={requests}
            search={search}
            onSearchChange={setSearch}
          />
        )}
      </div>

      {showNewRequest && isReception && (
        <NewRequestModal
          requestedBy={user?.name ?? "Recepção"}
          onClose={() => setShowNewRequest(false)}
          onCreated={() => {
            refreshRequests();
            setShowNewRequest(false);
          }}
        />
      )}
    </DashboardLayout>
  );
}

function PageHeader({
  profile,
  onNewRequest,
}: {
  profile: string;
  onNewRequest?: () => void;
}) {
  const title =
    profile === "Profissional"
      ? "Solicitações de relatórios"
      : "Controle de solicitações de relatórios";

  const description =
    profile === "Profissional"
      ? "Elabore os relatórios solicitados, assine eletronicamente e encaminhe o documento pronto para a recepção."
      : "Acompanhe os relatórios solicitados pelos responsáveis, os profissionais responsáveis e os prazos de entrega.";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#e8eaf3] bg-white px-6 py-5 shadow-[0_4px_16px_rgba(51,65,120,0.04)] md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f0edff] text-[#6847f5]">
          <ClipboardList size={23} />
        </div>

        <div>
          <h1 className="text-xl font-extrabold text-[#10235f]">
            {title}
          </h1>

          <p className="mt-1 max-w-3xl text-sm font-medium leading-6 text-[#7b87a7]">
            {description}
          </p>
        </div>
      </div>

      {onNewRequest && (
        <button
          type="button"
          onClick={onNewRequest}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5d3df5] via-[#7046ff] to-[#8238ff] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(103,66,246,0.22)] transition hover:opacity-95"
        >
          <Plus size={17} />
          Nova solicitação
        </button>
      )}
    </div>
  );
}

function ManagementView({
  requests,
  search,
  onSearchChange,
}: {
  requests: ReportRequest[];
  search: string;
  onSearchChange: (value: string) => void;
}) {
  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");

    if (!normalizedSearch) {
      return requests;
    }

    return requests.filter((request) => {
      return [
        request.patientName,
        request.responsibleName,
        request.purpose,
        request.requestedBy,
        ...request.items.map((item) => item.professionalName),
      ].some((value) =>
        value.toLocaleLowerCase("pt-BR").includes(normalizedSearch)
      );
    });
  }, [requests, search]);

  const allItems = requests.flatMap((request) =>
    request.items.map((item) => ({ request, item }))
  );

  const delivered = allItems.filter(
    ({ item }) => item.status === "Entregue"
  ).length;

  const overdue = allItems.filter(
    ({ request, item }) =>
      getReportItemDisplayStatus(request, item) === "Em atraso"
  ).length;

  const pending = allItems.length - delivered;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Solicitações"
          value={requests.length}
          description="Pedidos registrados"
          icon={<ClipboardList size={19} />}
          style="purple"
        />

        <SummaryCard
          title="Relatórios pendentes"
          value={pending}
          description="Ainda não entregues"
          icon={<Clock3 size={19} />}
          style="amber"
        />

        <SummaryCard
          title="Entregues"
          value={delivered}
          description="Concluídos pelos profissionais"
          icon={<FileCheck2 size={19} />}
          style="green"
        />

        <SummaryCard
          title="Em atraso"
          value={overdue}
          description="Prazo de entrega vencido"
          icon={<AlertCircle size={19} />}
          style="red"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#e8eaf3] bg-white shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
        <div className="flex flex-col gap-4 border-b border-[#eceef5] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[#10235f]">
              Acompanhamento das solicitações
            </h2>

            <p className="mt-1 text-xs font-medium text-[#8a95b4]">
              Cada coluna mostra a situação do relatório por especialidade.
            </p>
          </div>

          <SearchBox value={search} onChange={onSearchChange} />
        </div>

        {filteredRequests.length === 0 ? (
          <EmptyState
            title="Nenhuma solicitação encontrada"
            description={
              requests.length === 0
                ? "As solicitações criadas pela recepção aparecerão aqui."
                : "Não encontramos resultados para a busca informada."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1780px]">
              <thead className="border-b border-[#e9ebf3] bg-[#f8f9fc]">
                <tr>
                  <TableHeader className="min-w-[230px]">
                    Paciente
                  </TableHeader>

                  <TableHeader className="min-w-[120px]">
                    Data solicitação
                  </TableHeader>

                  {REPORT_REQUEST_SPECIALTIES.map((specialty) => (
                    <TableHeader
                      key={specialty.key}
                      className="min-w-[170px] text-center"
                    >
                      {specialty.shortLabel}
                    </TableHeader>
                  ))}

                  <TableHeader className="min-w-[125px]">
                    Prazo
                  </TableHeader>

                  <TableHeader className="min-w-[180px]">
                    Finalidade
                  </TableHeader>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#eef0f5]">
                {filteredRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="align-top transition hover:bg-[#fcfbff]"
                  >
                    <td className="px-4 py-4">
                      <p className="text-sm font-extrabold text-[#263765]">
                        {request.patientName}
                      </p>

                      <p className="mt-1 text-[11px] font-semibold text-[#8a95b4]">
                        Responsável: {request.responsibleName || "-"}
                      </p>

                      <p className="mt-1 text-[10px] font-medium text-[#a0a8bd]">
                        Solicitado por {request.requestedBy}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-xs font-semibold text-[#667394]">
                      {formatDate(request.requestedAt)}
                    </td>

                    {REPORT_REQUEST_SPECIALTIES.map((specialty) => {
                      const item = request.items.find(
                        (requestItem) =>
                          requestItem.specialtyKey === specialty.key
                      );

                      return (
                        <td
                          key={specialty.key}
                          className="px-3 py-4 text-center"
                        >
                          {item ? (
                            <SpecialtyStatusCell
                              request={request}
                              item={item}
                            />
                          ) : (
                            <span className="text-sm font-semibold text-[#c0c5d2]">
                              -
                            </span>
                          )}
                        </td>
                      );
                    })}

                    <td className="px-4 py-4">
                      <p className="text-xs font-extrabold text-[#34456f]">
                        {formatDate(request.deadline)}
                      </p>

                      <p className="mt-1 text-[10px] font-medium text-[#99a2b8]">
                        Mínimo de 7 dias úteis
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-xs font-semibold leading-5 text-[#657295]">
                        {request.purpose || "-"}
                      </p>

                      {request.notes && (
                        <p className="mt-1 line-clamp-2 text-[10px] font-medium leading-4 text-[#9aa3b9]">
                          {request.notes}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function ProfessionalView({
  requests,
  search,
  onSearchChange,
  professionalName,
}: {
  requests: ReportRequest[];
  search: string;
  onSearchChange: (value: string) => void;
  professionalName: string;
}) {
  const professionalSpecialty = getProfessionalSpecialty(professionalName);

  const professionalItems = useMemo(() => {
    return requests
      .flatMap((request) =>
        request.items.map((item) => ({ request, item }))
      )
      .filter(({ item }) =>
        isProfessionalResponsibleForItem(
          professionalName,
          professionalSpecialty,
          item
        )
      );
  }, [requests, professionalName, professionalSpecialty]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");

    if (!normalizedSearch) {
      return professionalItems;
    }

    return professionalItems.filter(({ request, item }) =>
      [
        request.patientName,
        request.responsibleName,
        request.purpose,
        item.specialtyLabel,
      ].some((value) =>
        value.toLocaleLowerCase("pt-BR").includes(normalizedSearch)
      )
    );
  }, [professionalItems, search]);

  const delivered = professionalItems.filter(
    ({ item }) => item.status === "Entregue"
  ).length;

  const overdue = professionalItems.filter(
    ({ request, item }) =>
      getReportItemDisplayStatus(request, item) === "Em atraso"
  ).length;

  const pending = professionalItems.length - delivered;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Pendentes"
          value={pending}
          description="Relatórios para produzir"
          icon={<Clock3 size={19} />}
          style="amber"
        />

        <SummaryCard
          title="Entregues"
          value={delivered}
          description="Finalizados por você"
          icon={<CheckCircle2 size={19} />}
          style="green"
        />

        <SummaryCard
          title="Em atraso"
          value={overdue}
          description="Prazo já vencido"
          icon={<AlertCircle size={19} />}
          style="red"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#e8eaf3] bg-white shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
        <div className="flex flex-col gap-4 border-b border-[#eceef5] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[#10235f]">
              Meus relatórios solicitados
            </h2>

            <p className="mt-1 text-xs font-medium text-[#8a95b4]">
              {professionalSpecialty
                ? `Especialidade: ${professionalSpecialty}`
                : "Solicitações direcionadas ao seu usuário profissional."}
            </p>
          </div>

          <SearchBox value={search} onChange={onSearchChange} />
        </div>

        {filteredItems.length === 0 ? (
          <EmptyState
            title="Nenhum relatório pendente para você"
            description="Quando a recepção direcionar uma solicitação para você, ela aparecerá nesta tela."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead className="border-b border-[#e9ebf3] bg-[#fbfbfe]">
                <tr>
                  <TableHeader>Paciente</TableHeader>
                  <TableHeader>Especialidade</TableHeader>
                  <TableHeader>Solicitado em</TableHeader>
                  <TableHeader>Prazo</TableHeader>
                  <TableHeader>Finalidade</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader className="text-center">Ação</TableHeader>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#eef0f5]">
                {filteredItems.map(({ request, item }) => {
                  const displayStatus = getReportItemDisplayStatus(
                    request,
                    item
                  );

                  return (
                    <tr
                      key={item.id}
                      className="transition hover:bg-[#fcfbff]"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-extrabold text-[#263765]">
                          {request.patientName}
                        </p>

                        <p className="mt-1 text-[11px] font-semibold text-[#8a95b4]">
                          Responsável: {request.responsibleName || "-"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-[#657295]">
                        {item.specialtyLabel}
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-[#657295]">
                        {formatDate(request.requestedAt)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="inline-flex items-center gap-2 text-xs font-extrabold text-[#34456f]">
                          <CalendarClock size={14} />
                          {formatDate(request.deadline)}
                        </div>
                      </td>

                      <td className="max-w-[260px] px-5 py-4 text-xs font-semibold leading-5 text-[#657295]">
                        {request.purpose || "-"}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={displayStatus} />
                      </td>

                      <td className="px-5 py-4">
                        <ProfessionalStatusActions
                          request={request}
                          item={item}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function ProfessionalStatusActions({
  request,
  item,
}: {
  request: ReportRequest;
  item: ReportRequestItem;
}) {
  const navigate =
    useNavigate();

  const [
    open,
    setOpen,
  ] =
    useState(false);

  const document =
    getRequestedReportDocument(
      request.id,
      item.id
    );

  const options: Array<{
    status: ReportRequestStatus;
    label: string;
  }> = [
    {
      status: "Solicitado",
      label: "Solicitado",
    },
    {
      status: "Em andamento",
      label: "Em andamento",
    },
  ];

  const reportLabel =
    document?.status ===
    "Enviado"
      ? "Abrir relatório"
      : document
          ? "Continuar relatório"
          : "Elaborar relatório";

  return (
    <div className="flex min-w-[210px] flex-col items-center gap-2">
      <button
        type="button"
        onClick={() =>
          navigate(
            `/solicitacoes-relatorios/${request.id}/${item.id}/relatorio`
          )
        }
        className={`inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-extrabold transition ${
          document?.status ===
          "Enviado"
            ? "border border-[#c7eadb] bg-[#eaf8f2] text-[#269d75] hover:bg-[#ddf4ea]"
            : "bg-gradient-to-r from-[#5d3df5] to-[#7a43ff] text-white shadow-[0_6px_14px_rgba(103,66,246,0.18)] hover:opacity-95"
        }`}
      >
        <FileText
          size={14}
        />
        {reportLabel}
      </button>

      {document?.status ===
      "Enviado" ? (
        <div className="text-center">
          <p className="text-[10px] font-extrabold text-[#24936d]">
            Encaminhado à recepção
          </p>

          <p className="mt-0.5 text-[9px] font-medium text-[#98a2b7]">
            {formatDateTime(
              document.sentAt
            )}
          </p>
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpen(
                (
                  current
                ) =>
                  !current
              )
            }
            className="inline-flex h-8 items-center gap-2 rounded-lg border border-[#e3e5ee] bg-white px-3 text-[10px] font-extrabold text-[#667394] transition hover:bg-[#f8f9fc]"
          >
            Status
            <ChevronDown
              size={12}
            />
          </button>

          {open && (
            <div className="absolute right-0 top-10 z-30 w-48 overflow-hidden rounded-xl border border-[#e6e8f0] bg-white p-1.5 shadow-[0_12px_30px_rgba(37,46,90,0.16)]">
              {options.map(
                (
                  option
                ) => (
                  <button
                    key={
                      option.status
                    }
                    type="button"
                    onClick={() => {
                      updateReportRequestItemStatus(
                        request.id,
                        item.id,
                        option.status
                      );

                      setOpen(
                        false
                      );
                    }}
                    className="flex w-full items-center rounded-lg px-3 py-2 text-left text-xs font-bold text-[#566487] transition hover:bg-[#f6f4ff] hover:text-[#6543ef]"
                  >
                    {
                      option.label
                    }
                  </button>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SpecialtyStatusCell({
  request,
  item,
}: {
  request: ReportRequest;
  item: ReportRequestItem;
}) {
  const navigate =
    useNavigate();

  const status =
    getReportItemDisplayStatus(
      request,
      item
    );

  const document =
    getRequestedReportDocument(
      request.id,
      item.id
    );

  return (
    <div className="mx-auto flex max-w-[165px] flex-col items-center gap-1.5">
      <StatusBadge
        status={
          status
        }
      />

      <span
        className="max-w-full truncate text-[10px] font-semibold text-[#7d87a4]"
        title={
          item.professionalName ||
          "Profissional não definido"
        }
      >
        {item.professionalName ||
          "A definir"}
      </span>

      {document?.status ===
        "Enviado" && (
        <button
          type="button"
          onClick={() =>
            navigate(
              `/solicitacoes-relatorios/${request.id}/${item.id}/relatorio`
            )
          }
          className="mt-1 inline-flex items-center gap-1 rounded-lg border border-[#c7eadb] bg-[#eaf8f2] px-2 py-1 text-[9px] font-extrabold text-[#269d75] transition hover:bg-[#ddf4ea]"
        >
          <FileText
            size={11}
          />
          Abrir relatório
        </button>
      )}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: ReportRequestDisplayStatus;
}) {
  const styles: Record<ReportRequestDisplayStatus, string> = {
    Solicitado:
      "border-[#ead9b2] bg-[#f8f1df] text-[#9c7629]",
    "Em andamento":
      "border-[#cfe0ff] bg-[#edf4ff] text-[#3d75ca]",
    Entregue:
      "border-[#c7eadb] bg-[#eaf8f2] text-[#269d75]",
    "Em atraso":
      "border-[#ffcfd6] bg-[#fff0f2] text-[#d84c62]",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon,
  style,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  style: "purple" | "amber" | "green" | "red";
}) {
  const styles = {
    purple: {
      icon: "bg-[#eeeaff] text-[#6847f5]",
      value: "text-[#6847f5]",
    },
    amber: {
      icon: "bg-[#fff4e7] text-[#ed982f]",
      value: "text-[#dc8a27]",
    },
    green: {
      icon: "bg-[#e8faf4] text-[#2daf82]",
      value: "text-[#269d75]",
    },
    red: {
      icon: "bg-[#fff0f3] text-[#eb5771]",
      value: "text-[#df4e67]",
    },
  }[style];

  return (
    <div className="rounded-2xl border border-[#e8eaf3] bg-white p-5 shadow-[0_4px_16px_rgba(51,65,120,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-[#8390af]">
            {title}
          </p>

          <p className={`mt-2 text-3xl font-extrabold ${styles.value}`}>
            {value}
          </p>

          <p className="mt-1 text-[11px] font-medium text-[#9aa3b9]">
            {description}
          </p>
        </div>

        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}

function SearchBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative block w-full lg:w-[320px]">
      <Search
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aa4bb]"
      />

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar paciente ou profissional..."
        className="h-10 w-full rounded-xl border border-[#e2e5ee] bg-[#fbfcfe] pl-10 pr-4 text-xs font-semibold text-[#34456f] outline-none transition placeholder:text-[#adb5c8] focus:border-[#b7abff] focus:bg-white focus:ring-2 focus:ring-[#eeeaff]"
      />
    </label>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f2efff] text-[#6b4cf5]">
        <ClipboardList size={24} />
      </span>

      <h3 className="mt-4 text-sm font-extrabold text-[#293b69]">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-xs font-medium leading-5 text-[#8a95b4]">
        {description}
      </p>
    </div>
  );
}

function TableHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-[0.05em] text-[#7a86a5] ${className}`}
    >
      {children}
    </th>
  );
}

function NewRequestModal({
  requestedBy,
  onClose,
  onCreated,
}: {
  requestedBy: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const patients = useMemo(() => getPatients(), []);
  const professionals = useMemo(() => getActiveProfessionals(), []);

  const initialDate = todayIsoDate();

  const [patientId, setPatientId] = useState("");
  const [responsibleName, setResponsibleName] = useState("");
  const [requestedAt, setRequestedAt] = useState(initialDate);
  const [deadline, setDeadline] = useState(
    calculateBusinessDeadline(initialDate)
  );
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [specialties, setSpecialties] =
    useState<SpecialtySelectionState>(() => createEmptySpecialties());
  const [error, setError] = useState("");

  const selectedPatient = patients.find(
    (patient) => String(patient.id) === patientId
  );

  function handlePatientChange(value: string) {
    setPatientId(value);

    const patient = patients.find(
      (item) => String(item.id) === value
    );

    setResponsibleName(patient?.responsavelNome ?? "");
  }

  function handleRequestedAtChange(value: string) {
    setRequestedAt(value);
    setDeadline(calculateBusinessDeadline(value));
  }

  function professionalsForSpecialty(key: ReportSpecialtyKey) {
    const specialty = REPORT_REQUEST_SPECIALTIES.find(
      (item) => item.key === key
    );

    if (!specialty) {
      return [];
    }

    const normalizedAccepted = specialty.professionalSpecialties.map(
      (name) => name.toLocaleLowerCase("pt-BR")
    );

    return professionals.filter((professional) =>
      normalizedAccepted.includes(
        professional.specialty.toLocaleLowerCase("pt-BR")
      )
    );
  }

  function toggleSpecialty(key: ReportSpecialtyKey) {
    const current = specialties[key];
    const nextSelected = !current.selected;
    const options = professionalsForSpecialty(key);
    const firstProfessional = options[0];

    setSpecialties((state) => ({
      ...state,
      [key]: {
        selected: nextSelected,
        professionalId:
          nextSelected && firstProfessional
            ? firstProfessional.id
            : null,
        professionalName:
          nextSelected && firstProfessional
            ? firstProfessional.name
            : "",
      },
    }));
  }

  function setProfessional(
    key: ReportSpecialtyKey,
    professionalIdValue: string
  ) {
    const professional = professionals.find(
      (item) => String(item.id) === professionalIdValue
    );

    setSpecialties((state) => ({
      ...state,
      [key]: {
        ...state[key],
        professionalId: professional?.id ?? null,
        professionalName: professional?.name ?? "",
      },
    }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!selectedPatient) {
      setError("Selecione o paciente da solicitação.");
      return;
    }

    if (!responsibleName.trim()) {
      setError("Informe o nome do responsável.");
      return;
    }

    if (!requestedAt || !deadline) {
      setError("Informe a data da solicitação e o prazo de entrega.");
      return;
    }

    const selectedSpecialties = REPORT_REQUEST_SPECIALTIES.filter(
      (specialty) => specialties[specialty.key].selected
    );

    if (selectedSpecialties.length === 0) {
      setError("Selecione pelo menos uma especialidade.");
      return;
    }

    createReportRequest({
      patientId: selectedPatient.id,
      patientName: selectedPatient.nome,
      responsibleName,
      requestedAt,
      deadline,
      purpose,
      notes,
      requestedBy,
      specialties: selectedSpecialties.map((specialty) => ({
        specialtyKey: specialty.key,
        specialtyLabel: specialty.label,
        professionalId: specialties[specialty.key].professionalId,
        professionalName: specialties[specialty.key].professionalName,
      })),
    });

    onCreated();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#172554]/35 p-4 backdrop-blur-[2px]">
      <div className="max-h-[94vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_24px_70px_rgba(28,38,86,0.24)]">
        <div className="flex items-center justify-between border-b border-[#eceef5] px-6 py-5">
          <div>
            <h2 className="text-lg font-extrabold text-[#10235f]">
              Nova solicitação de relatório
            </h2>

            <p className="mt-1 text-xs font-medium text-[#8a95b4]">
              Registre o pedido do responsável e encaminhe para as especialidades.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6f7fb] text-[#73809f] transition hover:bg-[#eeeaff] hover:text-[#6543ef]"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[calc(94vh-154px)] space-y-6 overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Paciente" required>
                <select
                  value={patientId}
                  onChange={(event) =>
                    handlePatientChange(event.target.value)
                  }
                  className={inputClassName}
                >
                  <option value="">Selecione o paciente</option>

                  {patients
                    .filter((patient) => patient.status === "Ativo")
                    .map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.nome}
                      </option>
                    ))}
                </select>
              </FormField>

              <FormField label="Responsável" required>
                <div className="relative">
                  <UserRound
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ba5bc]"
                  />

                  <input
                    value={responsibleName}
                    onChange={(event) =>
                      setResponsibleName(event.target.value)
                    }
                    placeholder="Nome do responsável"
                    className={`${inputClassName} pl-10`}
                  />
                </div>
              </FormField>

              <FormField label="Data da solicitação" required>
                <input
                  type="date"
                  value={requestedAt}
                  onChange={(event) =>
                    handleRequestedAtChange(event.target.value)
                  }
                  className={inputClassName}
                />
              </FormField>

              <FormField label="Prazo para entrega" required>
                <input
                  type="date"
                  value={deadline}
                  min={requestedAt}
                  onChange={(event) => setDeadline(event.target.value)}
                  className={inputClassName}
                />

                <p className="mt-1.5 text-[10px] font-medium text-[#98a2b7]">
                  O sistema sugere automaticamente 7 dias úteis após a solicitação.
                </p>
              </FormField>

              <div className="md:col-span-2">
                <FormField label="Finalidade do relatório">
                  <input
                    value={purpose}
                    onChange={(event) => setPurpose(event.target.value)}
                    placeholder="Ex.: Neuropediatra, plano, audiência, processo judicial..."
                    className={inputClassName}
                  />
                </FormField>
              </div>
            </div>

            <div>
              <div className="mb-3">
                <h3 className="text-sm font-extrabold text-[#293b69]">
                  Especialidades solicitadas
                </h3>

                <p className="mt-1 text-[11px] font-medium text-[#8a95b4]">
                  Marque as especialidades e, quando houver profissional cadastrado, escolha quem ficará responsável pelo relatório.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {REPORT_REQUEST_SPECIALTIES.map((specialty) => {
                  const selected = specialties[specialty.key];
                  const specialtyProfessionals =
                    professionalsForSpecialty(specialty.key);

                  return (
                    <div
                      key={specialty.key}
                      className={`rounded-2xl border p-4 transition ${
                        selected.selected
                          ? "border-[#cfc5ff] bg-[#faf8ff]"
                          : "border-[#e6e8f0] bg-white"
                      }`}
                    >
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selected.selected}
                          onChange={() => toggleSpecialty(specialty.key)}
                          className="h-4 w-4 accent-[#6847f5]"
                        />

                        <span className="text-xs font-extrabold text-[#34456f]">
                          {specialty.label}
                        </span>
                      </label>

                      {selected.selected && (
                        <div className="mt-3">
                          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.04em] text-[#8994ad]">
                            Profissional responsável
                          </label>

                          <select
                            value={
                              selected.professionalId
                                ? String(selected.professionalId)
                                : ""
                            }
                            onChange={(event) =>
                              setProfessional(
                                specialty.key,
                                event.target.value
                              )
                            }
                            className={`${inputClassName} h-10 text-xs`}
                          >
                            <option value="">A definir</option>

                            {specialtyProfessionals.map((professional) => (
                              <option
                                key={professional.id}
                                value={professional.id}
                              >
                                {professional.name}
                              </option>
                            ))}
                          </select>

                          {specialtyProfessionals.length === 0 && (
                            <p className="mt-1.5 text-[10px] font-medium text-[#b08a43]">
                              Nenhum profissional ativo desta especialidade está cadastrado nas configurações.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <FormField label="Observações">
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                placeholder="Informações adicionais para os profissionais..."
                className={`${inputClassName} h-auto resize-none py-3`}
              />
            </FormField>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-[#ffd4da] bg-[#fff3f5] px-4 py-3 text-xs font-bold text-[#d94f64]">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#eceef5] bg-[#fbfcfe] px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-xl border border-[#e0e3ec] bg-white px-5 text-sm font-bold text-[#667394] transition hover:bg-[#f7f8fb]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5d3df5] via-[#7046ff] to-[#8238ff] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(103,66,246,0.20)] transition hover:opacity-95"
            >
              <Send size={16} />
              Enviar solicitação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-[#566487]">
        {label}
        {required && <span className="ml-1 text-[#e35568]">*</span>}
      </span>

      {children}
    </label>
  );
}

const inputClassName =
  "h-11 w-full rounded-xl border border-[#e0e3ec] bg-[#fbfcfe] px-3.5 text-sm font-semibold text-[#34456f] outline-none transition placeholder:text-[#adb5c8] focus:border-[#b7abff] focus:bg-white focus:ring-2 focus:ring-[#eeeaff]";