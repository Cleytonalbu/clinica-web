import {
  getActiveProfessionals,
} from "@/pages/Configuracoes/settingsStorage";

/* =========================================
   REGRAS DE ACESSO A PACIENTES
========================================= */

/*
 * O vínculo real Paciente ↔ Profissional (por agendamento ou objetivo
 * terapêutico) agora é aplicado pelo próprio backend: GET /pacientes e
 * GET /pacientes/:id já filtram/negam para quem loga como PROFISSIONAL
 * (ver ServicoPacientes.listar/buscarPorId na API). As funções que
 * replicavam essa regra no front com dados mock (getProfessionalAccessible-
 * PatientIds / canProfessionalAccessPatient) foram removidas — confiar na
 * resposta da API é a fonte de verdade agora.
 *
 * getProfessionalSpecialty continua aqui porque ainda não existe, no
 * backend, um jeito barato de resolver "especialidade do profissional
 * logado" fora do cadastro de Configurações (mock).
 */

export function getProfessionalSpecialty(
  professionalName:
    string
) {
  return (
    getActiveProfessionals().find(
      (
        professional
      ) =>
        professional.name ===
        professionalName
    )?.specialty ??
    ""
  );
}
