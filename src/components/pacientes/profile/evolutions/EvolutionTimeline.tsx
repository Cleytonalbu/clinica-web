import {
  ClipboardList,
} from "lucide-react";

import {
  useMemo,
} from "react";

import {
  useParams,
} from "react-router-dom";

import {
  EvolutionCard,
} from "./EvolutionCard";

import {
  getEvolutionsByPatientId,
} from "@/pages/Pacientes/evolutionStorage";

/* =========================================
   COMPONENTE
========================================= */

export function EvolutionTimeline() {
  const {
    id,
  } =
    useParams();

  const patientId =
    Number(
      id
    );

  /* =======================================
     EVOLUÇÕES DO PACIENTE
  ======================================= */

  const evolutions =
    useMemo(
      () => {
        if (
          !Number.isFinite(
            patientId
          ) ||
          patientId <= 0
        ) {
          return [];
        }

        return getEvolutionsByPatientId(
          patientId
        );
      },
      [
        patientId,
      ]
    );

  /* =======================================
     RENDER
  ======================================= */

  return (
    <div className="space-y-6">
      {evolutions.length ===
      0 ? (
        /* ================================= */
        /* ESTADO VAZIO */
        /* ================================= */

        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <ClipboardList
              size={26}
            />
          </div>

          <h3 className="mt-4 font-semibold text-slate-800">
            Nenhuma evolução registrada
          </h3>

          <p className="mt-2 max-w-md text-sm text-slate-500">
            As evoluções clínicas registradas para este paciente aparecerão aqui.
          </p>
        </div>
      ) : (
        /* ================================= */
        /* LISTA */
        /* ================================= */

        evolutions.map(
          (
            evolution
          ) => (
            <EvolutionCard
              key={
                evolution.id
              }
              evolution={
                evolution
              }
            />
          )
        )
      )}
    </div>
  );
}