import { CampoTextarea } from "../Campos";
import { CampoCups, type ItemCups } from "../CampoCups";
import { abrirFormulaManualIncapacidad } from "../../services/formulaManual";

interface Modulo8Props {
  datos: Record<string, any>;
  onChange: (campo: string, valor: any) => void;
}

export function Modulo8Incapacidad({ datos, onChange }: Modulo8Props) {
  // apoyo_diagnostico_cups se guarda como array de ItemCups en el estado
  const cupsSeleccionados: ItemCups[] = Array.isArray(datos.apoyo_diagnostico_cups)
    ? datos.apoyo_diagnostico_cups
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          8. Incapacidad y Apoyo Diagnóstico
        </h2>
        <p className="text-sm text-slate-500">
          Incapacidad médica y solicitudes de procedimientos diagnósticos (CUPS).
        </p>
      </div>

      {/* Incapacidad */}
      <CampoTextarea
        label="Motivo de Incapacidad"
        value={datos.incapacidad}
        onChange={(v) => onChange("incapacidad", v)}
        rows={3}
      />

      <button
        type="button"
        onClick={() => abrirFormulaManualIncapacidad()}
        className="text-sm bg-[#14375e] hover:bg-[#0f2c4c] active:scale-[0.98]
                   text-white px-4 py-2.5 rounded-lg transition-all"
      >
        Fórmula Manual (PDF)
      </button>

      {/* Solicitudes de apoyo diagnóstico — CUPS */}
      <div className="border-t border-slate-200 pt-4">
        <CampoCups
          label="Solicitudes de Apoyo Diagnóstico (CUPS)"
          seleccionados={cupsSeleccionados}
          onChange={(items) => onChange("apoyo_diagnostico_cups", items)}
        />
        <p className="mt-1 text-xs text-slate-400">
          Busque por código CUPS o por nombre del procedimiento (mínimo 2 caracteres).
        </p>
      </div>

      {/* Texto libre adicional si el médico necesita aclarar algo */}
      <CampoTextarea
        label="Observaciones adicionales de apoyo diagnóstico"
        value={datos.solicitudes_apoyo_diagnostico ?? ""}
        onChange={(v) => onChange("solicitudes_apoyo_diagnostico", v)}
        rows={2}
      />
    </div>
  );
}