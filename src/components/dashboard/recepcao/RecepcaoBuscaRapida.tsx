import {
  Search,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";
import {
  useNavigate,
} from "react-router-dom";

import {
  getPatients,
} from "@/pages/Pacientes/patientStorage";
import {
  getResponsiblePatientIds,
  getResponsibles,
} from "@/pages/Pacientes/responsiblePatientStorage";

type SearchFilter =
  | "all"
  | "patients"
  | "responsibles";

type QuickSearchResult =
  | {
      type: "patient";
      id: number;
      title: string;
      subtitle: string;
      extra?: string;
    }
  | {
      type: "responsible";
      id: number;
      title: string;
      subtitle: string;
      extra?: string;
    };

function normalizeText(
  value?: string | null
) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function normalizeDocument(
  value?: string | null
) {
  return (value ?? "").replace(
    /\D/g,
    ""
  );
}

export function RecepcaoBuscaRapida() {
  const navigate =
    useNavigate();

  const [query, setQuery] =
    useState("");

  const [filter, setFilter] =
    useState<SearchFilter>(
      "all"
    );

  const [searched, setSearched] =
    useState(false);

  const normalizedQuery =
    normalizeText(query);

  const normalizedDocumentQuery =
    normalizeDocument(query);

  const results = useMemo<
    QuickSearchResult[]
  >(() => {
    if (
      !searched ||
      !normalizedQuery
    ) {
      return [];
    }

    const found: QuickSearchResult[] =
      [];

    if (
      filter === "all" ||
      filter === "patients"
    ) {
      getPatients().forEach(
        (patient) => {
          const patientSearchText =
            normalizeText(
              [
                patient.nome,
                patient.cpf,
                patient.telefone,
                patient.celular,
                patient.email,
                patient.responsavelNome,
              ]
                .filter(Boolean)
                .join(" ")
            );

          const cpfMatches =
            Boolean(
              normalizedDocumentQuery
            ) &&
            normalizeDocument(
              patient.cpf
            ).includes(
              normalizedDocumentQuery
            );

          if (
            !patientSearchText.includes(
              normalizedQuery
            ) &&
            !cpfMatches
          ) {
            return;
          }

          found.push({
            type: "patient",
            id: patient.id,
            title: patient.nome,
            subtitle:
              patient.cpf
                ? `CPF: ${patient.cpf}`
                : `Paciente #${patient.id}`,
            extra:
              patient.responsavelNome
                ? `Responsável: ${patient.responsavelNome}`
                : undefined,
          });
        }
      );
    }

    if (
      filter === "all" ||
      filter === "responsibles"
    ) {
      const patients =
        getPatients();

      getResponsibles().forEach(
        (responsible) => {
          if (!responsible.ativo) {
            return;
          }

          const linkedPatientIds =
            getResponsiblePatientIds(
              responsible.id
            );

          const linkedPatientNames =
            linkedPatientIds
              .map(
                (patientId) =>
                  patients.find(
                    (patient) =>
                      patient.id ===
                      patientId
                  )?.nome
              )
              .filter(
                (name): name is string =>
                  Boolean(name)
              );

          const responsibleSearchText =
            normalizeText(
              [
                responsible.nome,
                responsible.cpf,
                responsible.telefone,
                responsible.email,
                ...linkedPatientNames,
              ]
                .filter(Boolean)
                .join(" ")
            );

          const cpfMatches =
            Boolean(
              normalizedDocumentQuery
            ) &&
            normalizeDocument(
              responsible.cpf
            ).includes(
              normalizedDocumentQuery
            );

          if (
            !responsibleSearchText.includes(
              normalizedQuery
            ) &&
            !cpfMatches
          ) {
            return;
          }

          found.push({
            type: "responsible",
            id: responsible.id,
            title: responsible.nome,
            subtitle:
              responsible.cpf
                ? `CPF: ${responsible.cpf}`
                : responsible.telefone ||
                  "Responsável",
            extra:
              linkedPatientNames.length
                ? `Crianças: ${linkedPatientNames.join(
                    ", "
                  )}`
                : "Nenhuma criança vinculada",
          });
        }
      );
    }

    return found
      .sort((a, b) =>
        a.title.localeCompare(
          b.title,
          "pt-BR"
        )
      )
      .slice(0, 12);
  }, [
    filter,
    normalizedDocumentQuery,
    normalizedQuery,
    searched,
  ]);

  function handleSearch() {
    if (!query.trim()) {
      setSearched(false);
      return;
    }

    setSearched(true);
  }

  function handleClear() {
    setQuery("");
    setSearched(false);
  }

  function openResult(
    result: QuickSearchResult
  ) {
    if (
      result.type === "patient"
    ) {
      navigate(
        `/pacientes/${result.id}`
      );
      return;
    }

    navigate(
      `/responsaveis/${result.id}/editar`
    );
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (
      event.key === "Enter"
    ) {
      handleSearch();
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <Search
          size={20}
          className="text-teal-600"
        />

        <h2 className="text-lg font-bold text-slate-900">
          Busca rápida
        </h2>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Encontre informações de forma rápida.
      </p>

      <div className="relative mt-5">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(
              event.target.value
            );

            if (searched) {
              setSearched(false);
            }
          }}
          onKeyDown={
            handleKeyDown
          }
          placeholder="Buscar paciente ou responsável..."
          className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-10 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
        />

        {query ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
            aria-label="Limpar busca"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      <select
        value={filter}
        onChange={(event) => {
          setFilter(
            event.target
              .value as SearchFilter
          );

          if (searched) {
            setSearched(false);
          }
        }}
        className="mt-3 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-600 outline-none"
      >
        <option value="all">
          Todos os registros
        </option>

        <option value="patients">
          Pacientes
        </option>

        <option value="responsibles">
          Responsáveis
        </option>
      </select>

      <button
        type="button"
        onClick={handleSearch}
        className="mt-3 h-11 w-full rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-sm font-bold text-white shadow-sm transition hover:opacity-95"
      >
        Buscar
      </button>

      {searched ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <div className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
            {results.length > 0
              ? `${results.length} resultado${
                  results.length === 1
                    ? ""
                    : "s"
                } encontrado${
                  results.length === 1
                    ? ""
                    : "s"
                }`
              : "Nenhum registro encontrado"}
          </div>

          {results.map(
            (result) => (
              <button
                key={`${result.type}-${result.id}`}
                type="button"
                onClick={() =>
                  openResult(
                    result
                  )
                }
                className="flex w-full items-start gap-3 border-b border-slate-100 px-3 py-3 text-left transition last:border-b-0 hover:bg-teal-50/60"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                  {result.type ===
                  "patient" ? (
                    <UserRound
                      size={16}
                    />
                  ) : (
                    <UsersRound
                      size={16}
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-bold text-slate-800">
                      {result.title}
                    </span>

                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                      {result.type ===
                      "patient"
                        ? "Paciente"
                        : "Responsável"}
                    </span>
                  </div>

                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {result.subtitle}
                  </p>

                  {result.extra ? (
                    <p className="mt-0.5 truncate text-[11px] text-slate-400">
                      {result.extra}
                    </p>
                  ) : null}
                </div>
              </button>
            )
          )}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          if (
            filter ===
            "responsibles"
          ) {
            navigate(
              "/responsaveis"
            );
            return;
          }

          navigate(
            "/pacientes"
          );
        }}
        className="mt-4 text-xs font-semibold text-teal-600"
      >
        Busca avançada
      </button>
    </section>
  );
}
