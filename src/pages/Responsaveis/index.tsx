import {
  Search,
  UserPlus,
  Users,
  Pencil,
  Smartphone,
  WalletCards,
  FileText,
  type LucideIcon,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  DashboardLayout,
} from "@/layouts/DashboardLayout";

import {
  getResponsibles,
  getResponsiblePatientIds,
  getResponsiblePatientLinks,
  ensureLegacyPatientResponsibleLinks,
} from "@/pages/Pacientes/responsiblePatientStorage";

import {
  getPatients,
} from "@/pages/Pacientes/patientStorage";

export default function Responsaveis() {
  const navigate =
    useNavigate();

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    migrationVersion,
    setMigrationVersion,
  ] = useState(0);

  const patients =
    getPatients();

  /* =======================================
     MIGRAR CADASTROS ANTIGOS

     A migração acontece depois da montagem
     da tela, sem gravar localStorage durante
     a renderização do React.
  ======================================= */

  useEffect(
    () => {
      ensureLegacyPatientResponsibleLinks(
        patients
      );

      setMigrationVersion(
        (current) => current + 1
      );
    },
    []
  );

  const responsibles =
    useMemo(
      () => getResponsibles(),
      [migrationVersion]
    );

  const patientMap =
    useMemo(
      () =>
        new Map(
          patients.map(
            (patient) => [
              patient.id,
              patient,
            ]
          )
        ),
      [patients]
    );

  const filteredResponsibles =
    useMemo(
      () => {
        const term =
          search
            .trim()
            .toLocaleLowerCase(
              "pt-BR"
            );

        if (!term) {
          return responsibles;
        }

        return responsibles.filter(
          (responsible) => {
            const linkedPatientNames =
              getResponsiblePatientIds(
                responsible.id
              )
                .map(
                  (patientId) =>
                    patientMap.get(
                      patientId
                    )?.nome ?? ""
                )
                .join(" ");

            return [
              responsible.nome,
              responsible.cpf,
              responsible.telefone,
              responsible.email,
              linkedPatientNames,
            ]
              .join(" ")
              .toLocaleLowerCase(
                "pt-BR"
              )
              .includes(term);
          }
        );
      },
      [
        patientMap,
        responsibles,
        search,
      ]
    );

  const activeLinks =
    getResponsiblePatientLinks().filter(
      (link) => link.ativo
    );

  const appAccessCount =
    activeLinks.filter(
      (link) => link.acessoApp
    ).length;

  const financialAccessCount =
    activeLinks.filter(
      (link) =>
        link.acessoFinanceiro
    ).length;

  const documentAccessCount =
    activeLinks.filter(
      (link) =>
        link.acessoDocumentos
    ).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#eeeaff] to-[#e8e5ff] text-[#6847f5] shadow-[0_7px_18px_rgba(104,71,245,0.10)]">
              <Users size={23} />
            </div>

            <div>
              <h1 className="text-[30px] font-extrabold tracking-[-0.03em] text-[#10235f]">
                Responsáveis
              </h1>

              <p className="mt-1 text-sm font-medium text-[#7d89a8]">
                Gerencie os responsáveis e as crianças vinculadas a cada cadastro.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/responsaveis/novo"
              )
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5d3df5] to-[#773cf5] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(103,66,246,0.18)] transition hover:opacity-95"
          >
            <UserPlus size={18} />
            Novo responsável
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Responsáveis"
            value={String(
              responsibles.length
            )}
            icon={Users}
            className="text-[#6847f5]"
          />

          <MetricCard
            title="Acessos ao app"
            value={String(
              appAccessCount
            )}
            icon={Smartphone}
            className="text-[#3988e8]"
          />

          <MetricCard
            title="Acesso financeiro"
            value={String(
              financialAccessCount
            )}
            icon={WalletCards}
            className="text-[#2daf82]"
          />

          <MetricCard
            title="Acesso a documentos"
            value={String(
              documentAccessCount
            )}
            icon={FileText}
            className="text-[#ed982f]"
          />
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="relative max-w-xl">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Buscar por responsável, CPF, telefone, e-mail ou criança..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">
                    Responsável
                  </th>
                  <th className="px-5 py-4">
                    Contato
                  </th>
                  <th className="px-5 py-4">
                    Crianças vinculadas
                  </th>
                  <th className="px-5 py-4">
                    Status
                  </th>
                  <th className="px-5 py-4 text-right">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredResponsibles.map(
                  (responsible) => {
                    const linkedPatients =
                      getResponsiblePatientIds(
                        responsible.id
                      )
                        .map(
                          (patientId) =>
                            patientMap.get(
                              patientId
                            )
                        )
                        .filter(Boolean);

                    return (
                      <tr
                        key={
                          responsible.id
                        }
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-900">
                            {responsible.nome}
                          </div>

                          <div className="mt-1 text-xs text-slate-500">
                            {responsible.cpf ||
                              "CPF não informado"}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          <div>
                            {responsible.telefone ||
                              "Telefone não informado"}
                          </div>

                          <div className="mt-1 text-xs text-slate-500">
                            {responsible.email ||
                              "E-mail não informado"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {linkedPatients.length >
                          0 ? (
                            <div className="flex flex-wrap gap-2">
                              {linkedPatients.map(
                                (patient) => (
                                  <span
                                    key={
                                      patient!.id
                                    }
                                    className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700"
                                  >
                                    {patient!.nome}
                                  </span>
                                )
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">
                              Nenhuma criança vinculada
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                              responsible.ativo
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {responsible.ativo
                              ? "Ativo"
                              : "Inativo"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/responsaveis/${responsible.id}/editar`
                              )
                            }
                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-violet-200 bg-white px-3 text-xs font-bold text-violet-700 transition hover:bg-violet-50"
                          >
                            <Pencil size={15} />
                            Editar
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )}

                {filteredResponsibles.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-14 text-center text-sm text-slate-500"
                    >
                      Nenhum responsável encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  className: string;
}

function MetricCard({
  title,
  value,
  icon: Icon,
  className,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-extrabold text-[#10235f]">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 ${className}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}
