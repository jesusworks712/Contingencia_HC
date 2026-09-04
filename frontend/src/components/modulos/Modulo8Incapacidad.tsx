import { CampoTextarea } from "../Campos";

interface Modulo8Props {
  datos: Record<string, any>;
  onChange: (campo: string, valor: any) => void;
}

export function Modulo8Incapacidad({ datos, onChange }: Modulo8Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          8. Incapacidad
        </h2>
        <p className="text-sm text-slate-500">
          Motivo de la incapacidad, si aplica.
        </p>
      </div>

      <CampoTextarea
        label="Motivo de Incapacidad"
        value={datos.incapacidad}
        onChange={(v) => onChange("incapacidad", v)}
        rows={4}
      />
    </div>
  );
}