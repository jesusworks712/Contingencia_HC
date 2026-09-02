import { CampoTexto, CampoTextarea } from "../Campos";

interface Modulo7Props {
  datos: Record<string, any>;
  onChange: (campo: string, valor: string) => void;
}

export function Modulo7ValoracionDiagnosticos({ datos, onChange }: Modulo7Props) {
  function set(campo: string) {
    return (valor: string) => onChange(campo, valor);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          7. Valoracion Medica y Diagnosticos
        </h2>
        <p className="text-sm text-slate-500">
          Impresion diagnostica y clasificacion de la consulta.
        </p>
      </div>

      <CampoTextarea
        label="Valoracion Medica - Observacion"
        value={datos.valoracion_medica}
        onChange={set("valoracion_medica")}
        rows={5}
      />

      <div className="grid grid-cols-2 gap-4">
        <CampoTexto
          label="Diagnostico Principal"
          value={datos.diagnostico_principal}
          onChange={set("diagnostico_principal")}
        />
        <CampoTexto
          label="Diagnostico Relacionado 1"
          value={datos.diagnostico_relacionado_1}
          onChange={set("diagnostico_relacionado_1")}
        />
        <CampoTexto
          label="Diagnostico Relacionado 2"
          value={datos.diagnostico_relacionado_2}
          onChange={set("diagnostico_relacionado_2")}
        />
        <CampoTexto
          label="Diagnostico Relacionado 3"
          value={datos.diagnostico_relacionado_3}
          onChange={set("diagnostico_relacionado_3")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CampoTexto
          label="Causa Externa"
          value={datos.causa_externa}
          onChange={set("causa_externa")}
        />
        <CampoTexto
          label="Tipo Diagnostico"
          value={datos.tipo_diagnostico}
          onChange={set("tipo_diagnostico")}
        />
      </div>

      <CampoTexto
        label="Finalidad"
        value={datos.finalidad}
        onChange={set("finalidad")}
      />
    </div>
  );
}