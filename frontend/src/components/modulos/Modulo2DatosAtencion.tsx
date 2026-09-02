import { CampoTextarea } from "../Campos";

interface Modulo2Props {
  datos: Record<string, any>;
  onChange: (campo: string, valor: string) => void;
}

export function Modulo2DatosAtencion({ datos, onChange }: Modulo2Props) {
  function set(campo: string) {
    return (valor: string) => onChange(campo, valor);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          2. Datos de Atencion
        </h2>
        <p className="text-sm text-slate-500">
          Motivo de consulta y descripcion de la enfermedad actual.
        </p>
      </div>

      <CampoTextarea
        label="Motivo Consulta"
        value={datos.motivo_consulta}
        onChange={set("motivo_consulta")}
        rows={3}
      />

      <CampoTextarea
        label="Enfermedad Actual"
        value={datos.enfermedad_actual}
        onChange={set("enfermedad_actual")}
        rows={10}
      />
    </div>
  );
}