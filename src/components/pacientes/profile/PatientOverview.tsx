import {
  CalendarCheck2,
  HeartPulse,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { PageCard } from "@/components/ui";

const dadosPaciente = {
  cpf: "123.456.789-10",
  nascimento: "15/04/2018",
  sexo: "Feminino",
  telefone: "(83) 99999-9999",
  email: "responsavel@email.com",
  endereco: "Rua das Flores, 120 - Centro",
  convenio: "Particular",
  responsavel: "Ana Oliveira",
  parentesco: "Mãe",
};

export function PatientOverview() {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <PageCard
          title="Dados Pessoais"
          description="Informações cadastrais do paciente."
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InfoItem
              icon={<UserRound size={18} />}
              label="CPF"
              value={dadosPaciente.cpf}
            />

            <InfoItem
              icon={<CalendarCheck2 size={18} />}
              label="Data de nascimento"
              value={dadosPaciente.nascimento}
            />

            <InfoItem
              icon={<UserRound size={18} />}
              label="Sexo"
              value={dadosPaciente.sexo}
            />

            <InfoItem
              icon={<Phone size={18} />}
              label="Telefone"
              value={dadosPaciente.telefone}
            />

            <InfoItem
              icon={<MapPin size={18} />}
              label="Endereço"
              value={dadosPaciente.endereco}
            />

            <InfoItem
              icon={<ShieldCheck size={18} />}
              label="Convênio"
              value={dadosPaciente.convenio}
            />
          </div>
        </PageCard>

        <PageCard
          title="Responsável"
          description="Responsável legal vinculado ao paciente."
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InfoItem
              icon={<UserRound size={18} />}
              label="Nome"
              value={dadosPaciente.responsavel}
            />

            <InfoItem
              icon={<HeartPulse size={18} />}
              label="Parentesco"
              value={dadosPaciente.parentesco}
            />

            <InfoItem
              icon={<Phone size={18} />}
              label="Contato"
              value={dadosPaciente.telefone}
            />

            <InfoItem
              icon={<UserRound size={18} />}
              label="E-mail"
              value={dadosPaciente.email}
            />
          </div>
        </PageCard>
      </div>

      <div className="space-y-6">
        <PageCard
          title="Próxima Sessão"
          description="Próximo atendimento agendado."
        >
          <div className="rounded-xl bg-indigo-50 p-5">
            <p className="text-sm font-medium text-indigo-600">
              Segunda-feira
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              10:30
            </p>

            <div className="mt-4 border-t border-indigo-100 pt-4">
              <p className="font-semibold text-slate-800">
                Psicologia
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Dra. Ana Paula
              </p>
            </div>
          </div>
        </PageCard>

        <PageCard
          title="Resumo"
          description="Informações rápidas do acompanhamento."
        >
          <div className="space-y-4">
            <SummaryItem
              label="Atendimentos"
              value="24"
            />

            <SummaryItem
              label="Objetivos ativos"
              value="6"
            />

            <SummaryItem
              label="Evoluções"
              value="18"
            />

            <SummaryItem
              label="Documentos"
              value="7"
            />
          </div>
        </PageCard>
      </div>
    </div>
  );
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoItem({
  icon,
  label,
  value,
}: InfoItemProps) {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        {icon}
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-medium text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

interface SummaryItemProps {
  label: string;
  value: string;
}

function SummaryItem({
  label,
  value,
}: SummaryItemProps) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-600">
        {label}
      </span>

      <span className="font-bold text-slate-900">
        {value}
      </span>
    </div>
  );
}