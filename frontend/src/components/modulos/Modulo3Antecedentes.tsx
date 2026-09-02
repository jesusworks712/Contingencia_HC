import { CampoTextarea } from "../Campos";

interface Modulo3Props {
  datos: Record<string, any>;
  onChange: (campo: string, valor: string) => void;
}

export function Modulo3Antecedentes({ datos, onChange }: Modulo3Props) {
  function set(campo: string) {
    return (valor: string) => onChange(campo, valor);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          3. Antecedentes
        </h2>
        <p className="text-sm text-slate-500">
          Alergias y antecedentes traumatologicos / quirurgicos del paciente.
        </p>
      </div>

      <CampoTextarea
        label="Alergias - Descripcion"
        value={datos.alergias}
        onChange={set("alergias")}
        rows={3}
      />

      <CampoTextarea
        label="Antecedentes Traumatologicos - Descripcion"
        value={datos.antecedentes_traumatologicos}
        onChange={set("antecedentes_traumatologicos")}
        rows={3}
      />

      <CampoTextarea
        label="Antecedentes Quirurgicos - Descripcion"
        value={datos.antecedentes_quirurgicos}
        onChange={set("antecedentes_quirurgicos")}
        rows={3}
      />
    </div>
  );
}