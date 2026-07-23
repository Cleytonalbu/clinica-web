import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Input({ label, ...props }: InputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        {...props}
        className="
w-full
h-14
rounded-xl
border
border-slate-300
bg-white
pl-12
pr-12
text-slate-700
placeholder:text-slate-400
outline-none
transition-all
duration-200
focus:border-violet-500
focus:ring-4
focus:ring-violet-200
"
      />
    </div>
  );
}