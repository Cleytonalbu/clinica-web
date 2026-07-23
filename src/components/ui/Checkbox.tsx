type CheckboxProps = {
  label: string;
};

export function Checkbox({ label }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" className="h-4 w-4 accent-violet-600" />
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}
