import { Camera, UserRound } from "lucide-react";

interface PhotoUploadProps {
  preview?: string;
  onChange?: (file: File | null) => void;
}

export function PhotoUpload({
  preview,
  onChange,
}: PhotoUploadProps) {
  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0] ?? null;
    onChange?.(file);
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm">
        {preview ? (
          <img
            src={preview}
            alt="Foto do paciente"
            className="h-full w-full object-cover"
          />
        ) : (
          <UserRound
            size={42}
            className="text-slate-300"
          />
        )}
      </div>

      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
        <Camera size={16} />

        Adicionar foto

        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      <p className="text-center text-xs text-slate-500">
        PNG ou JPG. Recomendado: imagem quadrada.
      </p>
    </div>
  );
}