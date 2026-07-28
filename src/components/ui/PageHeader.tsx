interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({
  title,
  description,
}: PageHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800">
        {title}
      </h1>

      {description && (
        <p className="mt-2 text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}