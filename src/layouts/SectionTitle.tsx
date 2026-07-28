interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

export function SectionTitle({
  title,
  subtitle,
}: SectionTitleProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-2 text-sm text-slate-500">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}