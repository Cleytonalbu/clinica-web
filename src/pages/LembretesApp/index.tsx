import {
  BellRing,
  CalendarClock,
  CheckCircle2,
  Eye,
  Image as ImageIcon,
  MessageSquareText,
  Plus,
  Search,
  Smartphone,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Upload,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";
import {
  useAuth,
} from "@/auth/AuthContext";
import {
  useUnit,
} from "@/providers/UnitContext";
import {
  getPatients,
} from "@/pages/Pacientes/patientStorage";
import {
  patientWorksAtUnit,
} from "@/pages/Pacientes/patientUnitStorage";
import {
  getResponsibles,
  getResponsiblePatientLinks,
} from "@/pages/Pacientes/responsiblePatientStorage";
import {
  createAppReminder,
  getAppReminderReads,
  getAppReminderStatus,
  getAppRemindersByUnit,
  removeAppReminder,
  setAppReminderActive,
  type AppReminder,
  type AppReminderDisplayMode,
  type AppReminderTargetType,
} from "./appReminderStorage";

interface ReminderFormState {
  title: string;
  message: string;
  imageDataUrl: string;
  imageName: string;
  targetType: AppReminderTargetType;
  patientId: string;
  responsibleId: string;
  startsAt: string;
  endsAt: string;
  displayMode: AppReminderDisplayMode;
  active: boolean;
}

const initialForm: ReminderFormState = {
  title: "",
  message: "",
  imageDataUrl: "",
  imageName: "",
  targetType: "ALL_UNIT",
  patientId: "",
  responsibleId: "",
  startsAt: toLocalDateTimeInput(
    new Date()
  ),
  endsAt: "",
  displayMode: "UNTIL_ACKNOWLEDGED",
  active: true,
};

function toLocalDateTimeInput(date: Date) {
  const offset =
    date.getTimezoneOffset();
  return new Date(
    date.getTime() -
      offset * 60_000
  )
    .toISOString()
    .slice(0, 16);
}

function formatDateTime(
  value?: string
) {
  if (!value) {
    return "Sem data final";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  ).format(date);
}

function displayModeLabel(
  mode: AppReminderDisplayMode
) {
  switch (mode) {
    case "ONCE":
      return "Exibir uma única vez";
    case "ALWAYS_UNTIL_END":
      return "Sempre até a data final";
    default:
      return "Até clicar em Entendi";
  }
}

function targetLabel(
  reminder: AppReminder
) {
  if (
    reminder.targetType ===
    "PATIENT"
  ) {
    return `Paciente: ${
      reminder.patientName ??
      `#${reminder.patientId}`
    }`;
  }

  if (
    reminder.targetType ===
    "RESPONSIBLE"
  ) {
    return `Responsável: ${
      reminder.responsibleName ??
      `#${reminder.responsibleId}`
    }`;
  }

  return "Todos os responsáveis da unidade";
}

function statusClass(
  status: ReturnType<
    typeof getAppReminderStatus
  >
) {
  switch (status) {
    case "Ativo":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Agendado":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Encerrado":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-rose-50 text-rose-700 border-rose-200";
  }
}

export default function LembretesApp() {
  const { user } = useAuth();
  const { activeUnitId, activeUnit } =
    useUnit();

  const [refreshKey, setRefreshKey] =
    useState(0);
  const [search, setSearch] =
    useState("");
  const [showForm, setShowForm] =
    useState(false);
  const [preview, setPreview] =
    useState<AppReminder | null>(null);
  const [feedback, setFeedback] =
    useState<string | null>(null);
  const [form, setForm] =
    useState<ReminderFormState>(
      initialForm
    );
  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const reminders = useMemo(
    () =>
      getAppRemindersByUnit(
        activeUnitId
      ),
    [activeUnitId, refreshKey]
  );

  const patients = useMemo(
    () =>
      getPatients()
        .filter((patient) =>
          patientWorksAtUnit(
            patient.id,
            activeUnitId
          )
        )
        .sort((a, b) =>
          a.nome.localeCompare(
            b.nome,
            "pt-BR"
          )
        ),
    [activeUnitId]
  );

  const responsibles = useMemo(
    () => {
      const patientIds = new Set(
        patients.map(
          (patient) => patient.id
        )
      );

      const links =
        getResponsiblePatientLinks().filter(
          (link) =>
            link.ativo &&
            link.acessoApp &&
            patientIds.has(link.patientId)
        );

      const responsibleIds = new Set(
        links.map(
          (link) => link.responsibleId
        )
      );

      return getResponsibles()
        .filter(
          (responsible) =>
            responsible.ativo &&
            responsibleIds.has(
              responsible.id
            )
        )
        .sort((a, b) =>
          a.nome.localeCompare(
            b.nome,
            "pt-BR"
          )
        );
    },
    [patients]
  );

  const filteredReminders =
    useMemo(() => {
      const term = search
        .trim()
        .toLocaleLowerCase("pt-BR");

      if (!term) {
        return reminders;
      }

      return reminders.filter(
        (reminder) =>
          [
            reminder.title,
            reminder.message,
            reminder.patientName,
            reminder.responsibleName,
            targetLabel(reminder),
            getAppReminderStatus(
              reminder
            ),
          ]
            .filter(Boolean)
            .join(" ")
            .toLocaleLowerCase(
              "pt-BR"
            )
            .includes(term)
      );
    }, [reminders, search]);

  const activeCount =
    reminders.filter(
      (item) =>
        getAppReminderStatus(item) ===
        "Ativo"
    ).length;
  const scheduledCount =
    reminders.filter(
      (item) =>
        getAppReminderStatus(item) ===
        "Agendado"
    ).length;
  const totalViews = reminders.reduce(
    (total, item) =>
      total +
      getAppReminderReads(item.id)
        .length,
    0
  );

  function resetForm() {
    setForm({
      ...initialForm,
      startsAt: toLocalDateTimeInput(
        new Date()
      ),
    });
    setFeedback(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function openNewReminder() {
    resetForm();
    setShowForm(true);
  }

  function updateField<
    K extends keyof ReminderFormState
  >(
    field: K,
    value: ReminderFormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFeedback(
        "Selecione um arquivo de imagem."
      );
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setFeedback(
        "A imagem deve ter no máximo 4 MB."
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateField(
        "imageDataUrl",
        String(reader.result ?? "")
      );
      updateField(
        "imageName",
        file.name
      );
      setFeedback(null);
    };
    reader.readAsDataURL(file);
  }

  function saveReminder() {
    if (
      !user ||
      (user.profile !== "Gestor" &&
        user.profile !== "Recepção")
    ) {
      setFeedback(
        "Seu perfil não pode publicar lembretes no app."
      );
      return;
    }

    const selectedPatient =
      patients.find(
        (patient) =>
          patient.id ===
          Number(form.patientId)
      );
    const selectedResponsible =
      responsibles.find(
        (responsible) =>
          responsible.id ===
          Number(form.responsibleId)
      );

    try {
      createAppReminder({
        unitId: activeUnitId,
        title: form.title,
        message: form.message,
        imageDataUrl:
          form.imageDataUrl,
        imageName: form.imageName,
        targetType:
          form.targetType,
        patientId:
          selectedPatient?.id,
        patientName:
          selectedPatient?.nome,
        responsibleId:
          selectedResponsible?.id,
        responsibleName:
          selectedResponsible?.nome,
        startsAt: form.startsAt,
        endsAt:
          form.endsAt || undefined,
        displayMode:
          form.displayMode,
        active: form.active,
        createdByUserId: user.id,
        createdByName: user.name,
        createdByProfile:
          user.profile,
      });

      setShowForm(false);
      resetForm();
      setRefreshKey(
        (current) => current + 1
      );
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o lembrete."
      );
    }
  }

  function toggleReminder(
    reminder: AppReminder
  ) {
    setAppReminderActive(
      reminder.id,
      !reminder.active
    );
    setRefreshKey(
      (current) => current + 1
    );
  }

  function deleteReminder(
    reminder: AppReminder
  ) {
    const confirmed =
      window.confirm(
        `Excluir o lembrete “${reminder.title}”?`
      );

    if (!confirmed) {
      return;
    }

    removeAppReminder(reminder.id);
    setRefreshKey(
      (current) => current + 1
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
              <BellRing size={23} />
            </div>

            <div>
              <h1 className="text-[30px] font-extrabold tracking-[-0.03em] text-[#10235f]">
                Lembretes do App
              </h1>
              <p className="mt-1 text-sm font-medium text-[#7d89a8]">
                Crie avisos com texto, imagem ou os dois para aparecerem em destaque no app dos responsáveis.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openNewReminder}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5d3df5] to-[#773cf5] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(103,66,246,0.18)] transition hover:opacity-95"
          >
            <Plus size={18} />
            Novo lembrete
          </button>
        </div>

        <div className="rounded-2xl border border-violet-100 bg-violet-50/60 px-4 py-3 text-sm font-medium text-violet-800">
          Unidade atual: <strong>{activeUnit?.name ?? `#${activeUnitId}`}</strong>. Os lembretes criados aqui ficam vinculados a esta unidade.
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Lembretes"
            value={String(reminders.length)}
            icon={BellRing}
          />
          <MetricCard
            label="Ativos agora"
            value={String(activeCount)}
            icon={CheckCircle2}
          />
          <MetricCard
            label="Agendados"
            value={String(scheduledCount)}
            icon={CalendarClock}
          />
          <MetricCard
            label="Visualizações"
            value={String(totalViews)}
            icon={Eye}
          />
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative max-w-xl">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Buscar por título, destinatário ou status..."
              className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Lembrete</th>
                  <th className="px-5 py-4">Destino</th>
                  <th className="px-5 py-4">Período</th>
                  <th className="px-5 py-4">Exibição</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredReminders.map(
                  (reminder) => {
                    const status =
                      getAppReminderStatus(
                        reminder
                      );
                    const reads =
                      getAppReminderReads(
                        reminder.id
                      );

                    return (
                      <tr
                        key={reminder.id}
                        className="align-top transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex min-w-[240px] gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-violet-50 text-violet-700">
                              {reminder.imageDataUrl ? (
                                <img
                                  src={reminder.imageDataUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <MessageSquareText size={18} />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">
                                {reminder.title}
                              </p>
                              <p className="mt-1 max-w-[320px] line-clamp-2 text-xs text-slate-500">
                                {reminder.message || "Somente imagem"}
                              </p>
                              <p className="mt-2 text-[11px] font-semibold text-slate-400">
                                {reads.length} visualização(ões)
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-slate-700">
                          {targetLabel(reminder)}
                        </td>

                        <td className="min-w-[190px] px-5 py-4 text-xs text-slate-600">
                          <div>
                            Início: {formatDateTime(reminder.startsAt)}
                          </div>
                          <div className="mt-1">
                            Fim: {formatDateTime(reminder.endsAt)}
                          </div>
                        </td>

                        <td className="min-w-[180px] px-5 py-4 text-xs font-medium text-slate-600">
                          {displayModeLabel(reminder.displayMode)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusClass(status)}`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <IconButton
                              title="Visualizar como ficará no app"
                              onClick={() =>
                                setPreview(reminder)
                              }
                            >
                              <Eye size={16} />
                            </IconButton>

                            <IconButton
                              title={
                                reminder.active
                                  ? "Desativar lembrete"
                                  : "Ativar lembrete"
                              }
                              onClick={() =>
                                toggleReminder(reminder)
                              }
                            >
                              {reminder.active ? (
                                <ToggleRight
                                  size={18}
                                  className="text-emerald-600"
                                />
                              ) : (
                                <ToggleLeft
                                  size={18}
                                  className="text-slate-400"
                                />
                              )}
                            </IconButton>

                            <IconButton
                              title="Excluir lembrete"
                              onClick={() =>
                                deleteReminder(reminder)
                              }
                            >
                              <Trash2
                                size={16}
                                className="text-rose-600"
                              />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}

                {filteredReminders.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-14 text-center"
                    >
                      <BellRing
                        size={28}
                        className="mx-auto text-slate-300"
                      />
                      <p className="mt-3 text-sm font-bold text-slate-600">
                        Nenhum lembrete encontrado.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 p-4">
          <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-extrabold text-[#10235f]">
                  Novo lembrete do App
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  O aviso será publicado para a unidade atual e exibido em destaque ao abrir o app.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_320px]">
              <div className="space-y-5">
                <Field label="Título" required>
                  <input
                    value={form.title}
                    onChange={(event) =>
                      updateField(
                        "title",
                        event.target.value
                      )
                    }
                    placeholder="Ex.: Feriado municipal"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  />
                </Field>

                <Field label="Mensagem">
                  <textarea
                    value={form.message}
                    onChange={(event) =>
                      updateField(
                        "message",
                        event.target.value
                      )
                    }
                    rows={5}
                    placeholder="Digite a mensagem que aparecerá no balão do app..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                  />
                </Field>

                <Field label="Imagem opcional">
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                      <Upload size={16} />
                      Selecionar imagem
                    </button>
                    <span className="ml-3 text-xs text-slate-500">
                      JPG, PNG ou similar • até 4 MB
                    </span>

                    {form.imageDataUrl && (
                      <div className="mt-4 flex items-start gap-3">
                        <img
                          src={form.imageDataUrl}
                          alt="Prévia"
                          className="h-24 w-32 rounded-xl border border-slate-200 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-700">
                            {form.imageName}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              updateField("imageDataUrl", "");
                              updateField("imageName", "");
                              if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                              }
                            }}
                            className="mt-2 text-xs font-bold text-rose-600"
                          >
                            Remover imagem
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </Field>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Destinatário" required>
                    <select
                      value={form.targetType}
                      onChange={(event) => {
                        updateField(
                          "targetType",
                          event.target.value as AppReminderTargetType
                        );
                        updateField("patientId", "");
                        updateField("responsibleId", "");
                      }}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-400"
                    >
                      <option value="ALL_UNIT">
                        Todos os responsáveis da unidade
                      </option>
                      <option value="PATIENT">
                        Paciente específico
                      </option>
                      <option value="RESPONSIBLE">
                        Responsável específico
                      </option>
                    </select>
                  </Field>

                  {form.targetType === "PATIENT" && (
                    <Field label="Paciente" required>
                      <select
                        value={form.patientId}
                        onChange={(event) =>
                          updateField(
                            "patientId",
                            event.target.value
                          )
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-400"
                      >
                        <option value="">
                          Selecione o paciente
                        </option>
                        {patients.map((patient) => (
                          <option
                            key={patient.id}
                            value={patient.id}
                          >
                            {patient.nome}
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}

                  {form.targetType === "RESPONSIBLE" && (
                    <Field label="Responsável" required>
                      <select
                        value={form.responsibleId}
                        onChange={(event) =>
                          updateField(
                            "responsibleId",
                            event.target.value
                          )
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-400"
                      >
                        <option value="">
                          Selecione o responsável
                        </option>
                        {responsibles.map((responsible) => (
                          <option
                            key={responsible.id}
                            value={responsible.id}
                          >
                            {responsible.nome}
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Início da exibição" required>
                    <input
                      type="datetime-local"
                      value={form.startsAt}
                      onChange={(event) =>
                        updateField(
                          "startsAt",
                          event.target.value
                        )
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-violet-400"
                    />
                  </Field>

                  <Field label="Fim da exibição">
                    <input
                      type="datetime-local"
                      value={form.endsAt}
                      onChange={(event) =>
                        updateField(
                          "endsAt",
                          event.target.value
                        )
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-violet-400"
                    />
                  </Field>
                </div>

                <Field label="Forma de exibição" required>
                  <select
                    value={form.displayMode}
                    onChange={(event) =>
                      updateField(
                        "displayMode",
                        event.target.value as AppReminderDisplayMode
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-400"
                  >
                    <option value="ONCE">
                      Exibir uma única vez
                    </option>
                    <option value="UNTIL_ACKNOWLEDGED">
                      Exibir até o responsável clicar em “Entendi”
                    </option>
                    <option value="ALWAYS_UNTIL_END">
                      Exibir sempre até a data final
                    </option>
                  </select>
                </Field>

                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(event) =>
                      updateField(
                        "active",
                        event.target.checked
                      )
                    }
                    className="h-4 w-4 accent-violet-600"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-700">
                      Lembrete ativo
                    </p>
                    <p className="text-xs text-slate-500">
                      A data de início continua sendo respeitada mesmo quando o lembrete está ativo.
                    </p>
                  </div>
                </label>

                {feedback && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {feedback}
                  </div>
                )}
              </div>

              <ReminderPhonePreview
                title={form.title}
                message={form.message}
                imageDataUrl={form.imageDataUrl}
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50/70 px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="h-10 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveReminder}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-bold text-white hover:bg-violet-700"
              >
                <Smartphone size={16} />
                Salvar e publicar
              </button>
            </div>
          </div>
        </div>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/45 p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="w-full max-w-sm"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <ReminderPhonePreview
              title={preview.title}
              message={preview.message ?? ""}
              imageDataUrl={preview.imageDataUrl ?? ""}
              standalone
            />
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="mt-3 h-10 w-full rounded-xl bg-white text-sm font-bold text-slate-700 shadow"
            >
              Fechar prévia
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-extrabold text-[#10235f]">
            {value}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-[#526080]">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

function IconButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
    >
      {children}
    </button>
  );
}

function ReminderPhonePreview({
  title,
  message,
  imageDataUrl,
  standalone = false,
}: {
  title: string;
  message: string;
  imageDataUrl: string;
  standalone?: boolean;
}) {
  return (
    <div
      className={
        standalone
          ? "rounded-[32px] border-[7px] border-slate-900 bg-[#fbf9ff] p-4 shadow-2xl"
          : "sticky top-2 rounded-3xl border border-slate-200 bg-slate-50 p-4"
      }
    >
      {!standalone && (
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          <Smartphone size={15} />
          Prévia no app
        </div>
      )}

      <div className="flex min-h-[420px] items-center justify-center rounded-2xl bg-gradient-to-b from-[#f7f2ff] to-white p-4">
        <div className="w-full overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-[0_20px_50px_rgba(93,61,245,0.16)]">
          <div className="flex items-center gap-3 border-b border-violet-100 bg-violet-50 px-4 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white">
              <BellRing size={18} />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-violet-500">
                Lembrete da Clínica
              </p>
              <p className="text-sm font-extrabold text-[#10235f]">
                {title || "Título do lembrete"}
              </p>
            </div>
          </div>

          {imageDataUrl && (
            <img
              src={imageDataUrl}
              alt=""
              className="max-h-56 w-full object-cover"
            />
          )}

          <div className="p-4">
            {message ? (
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {message}
              </p>
            ) : imageDataUrl ? (
              <p className="text-xs text-slate-400">
                Aviso visual da clínica.
              </p>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-xs text-slate-400">
                <ImageIcon
                  size={24}
                  className="mx-auto mb-2"
                />
                Adicione uma mensagem, uma imagem ou os dois.
              </div>
            )}

            <button
              type="button"
              className="mt-5 h-10 w-full rounded-xl bg-violet-600 text-sm font-extrabold text-white"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
