import {
  ClipboardList,
  FileText,
  Users,
} from "lucide-react";

const stats = [
  {
    title: "Evoluções",
    value: "128",
    icon: ClipboardList,
  },

  {
    title: "Especialidades",
    value: "6",
    icon: Users,
  },

  {
    title: "Anexos",
    value: "38",
    icon: FileText,
  },
];

export function EvolutionStats() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  {stat.title}
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stat.value}
                </p>
              </div>

              <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
                <Icon size={22} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}