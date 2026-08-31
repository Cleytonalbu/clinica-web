import {
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  RefreshCcw,
  SlidersHorizontal,
} from "lucide-react";

import {
  useUnit,
} from "@/providers/UnitContext";

import {
  getActiveProfessionals,
  getActiveSpecialties,
} from "@/pages/Configuracoes/settingsStorage";

import {
  professionalWorksAtUnit,
} from "@/pages/Configuracoes/professionalUnitStorage";

import {
  specialtyWorksAtUnit,
} from "@/pages/Configuracoes/specialtyUnitStorage";


import {
  getPatients,
} from "@/pages/Pacientes/patientStorage";

function getCurrentMonthLabel() {
  const now =
    new Date();

  const first =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

  const last =
    new Date(
      now.getFullYear(),
      now.getMonth() +
        1,
      0
    );

  const format =
    (
      value:
        Date
    ) =>
      new Intl.DateTimeFormat(
        "pt-BR"
      ).format(
        value
      );

  return `${format(first)} até ${format(last)}`;
}

export function IndicadoresFiltros() {
  const {
    activeUnitId,
  } =
    useUnit();

  const [
    specialty,
    setSpecialty,
  ] =
    useState(
      "Todas"
    );

  const [
    professional,
    setProfessional,
  ] =
    useState(
      "Todos"
    );

  const [
    patient,
    setPatient,
  ] =
    useState(
      "Todos"
    );

  const specialties =
    useMemo(
      () =>
        getActiveSpecialties()
          .filter(
            (
              item
            ) =>
              specialtyWorksAtUnit(
                item.id,
                activeUnitId
              )
          )
          .sort(
            (
              a,
              b
            ) =>
              a.name.localeCompare(
                b.name,
                "pt-BR"
              )
          ),
      [
        activeUnitId,
      ]
    );

  const professionals =
    useMemo(
      () =>
        getActiveProfessionals()
          .filter(
            (
              item
            ) =>
              professionalWorksAtUnit(
                item.id,
                activeUnitId
              )
          )
          .sort(
            (
              a,
              b
            ) =>
              a.name.localeCompare(
                b.name,
                "pt-BR"
              )
          ),
      [
        activeUnitId,
      ]
    );

  const patients =
    useMemo(
      () =>
        getPatients()
          .filter(
            (
              item
            ) =>
              item.status ===
                "Ativo"
          )
          .sort(
            (
              a,
              b
            ) =>
              a.nome.localeCompare(
                b.nome,
                "pt-BR"
              )
          ),
      [
        activeUnitId,
      ]
    );

  function clearFilters() {
    setSpecialty(
      "Todas"
    );

    setProfessional(
      "Todos"
    );

    setPatient(
      "Todos"
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div>
          <label className="mb-2 block text-xs font-bold text-slate-600">
            Período
          </label>

          <div className="relative">
            <CalendarDays
              size={17}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500"
            />

            <input
              type="text"
              value={
                getCurrentMonthLabel()
              }
              readOnly
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-700 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold text-slate-600">
            Especialidade
          </label>

          <select
            value={
              specialty
            }
            onChange={(
              event
            ) =>
              setSpecialty(
                event.target.value
              )
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
          >
            <option value="Todas">
              Todas as especialidades
            </option>

            {specialties.map(
              (
                item
              ) => (
                <option
                  key={
                    item.id
                  }
                  value={
                    item.name
                  }
                >
                  {
                    item.name
                  }
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold text-slate-600">
            Profissional
          </label>

          <select
            value={
              professional
            }
            onChange={(
              event
            ) =>
              setProfessional(
                event.target.value
              )
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
          >
            <option value="Todos">
              Todos os profissionais
            </option>

            {professionals.map(
              (
                item
              ) => (
                <option
                  key={
                    item.id
                  }
                  value={
                    item.name
                  }
                >
                  {
                    item.name
                  }
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold text-slate-600">
            Criança
          </label>

          <select
            value={
              patient
            }
            onChange={(
              event
            ) =>
              setPatient(
                event.target.value
              )
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
          >
            <option value="Todos">
              Todas as crianças
            </option>

            {patients.map(
              (
                item
              ) => (
                <option
                  key={
                    item.id
                  }
                  value={
                    String(
                      item.id
                    )
                  }
                >
                  {
                    item.nome
                  }
                </option>
              )
            )}
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={
            clearFilters
          }
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <SlidersHorizontal
            size={16}
          />

          Limpar filtros
        </button>

        <button
          type="button"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          <RefreshCcw
            size={16}
          />

          Atualizar
        </button>
      </div>
    </section>
  );
}
