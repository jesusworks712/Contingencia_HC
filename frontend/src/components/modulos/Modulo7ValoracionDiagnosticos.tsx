/**
 * Módulo 7 — Valoración Médica y Diagnósticos
 *
 * Causa Externa, Tipo de Diagnóstico y Finalidad usan las listas
 * cerradas definidas en la Resolución 3374 de 2000 (RIPS).
 *
 * Los diagnósticos CIE-10 se escriben sin punto (ej: M544)
 * conforme a la práctica clínica estándar.
 */

import { CampoTexto, CampoTextarea, CampoSelect } from "../Campos";

// ── Listas normativas (Res. 3374/2000 - RIPS) ─────────────────────────────

const CAUSAS_EXTERNAS = [
  "Accidente de trabajo",
  "Accidente de tránsito",
  "Accidente rábico",
  "Accidente ofídico",
  "Otro tipo de accidente",
  "Evento catastrófico",
  "Lesión por agresión",
  "Lesión auto infligida",
  "Sospecha de maltrato físico",
  "Sospecha de abuso sexual",
  "Sospecha de violencia sexual",
  "Sospecha de maltrato emocional",
  "Enfermedad general",
  "Enfermedad laboral",
  "Otra",
];

const TIPOS_DIAGNOSTICO = [
  "Impresión diagnóstica",
  "Confirmado nuevo",
  "Confirmado repetido",
];

const FINALIDADES = [
  "Diagnóstico",
  "Tratamiento médico",
  "Tratamiento quirúrgico",
  "Tratamiento rehabilitación física",
  "Tratamiento rehabilitación mental",
  "Detección de alteraciones de crecimiento y desarrollo",
  "Detección de alteraciones del joven",
  "Detección de alteraciones del adulto",
  "Detección de alteraciones del anciano",
  "Detección de alteraciones de agudeza visual",
  "Control prenatal",
  "Atención del parto",
  "Atención del recién nacido",
  "Atención en planificación familiar",
  "Atención preventiva en salud bucal",
  "Atención curativa en salud bucal",
];

// ── Props ──────────────────────────────────────────────────────────────────
interface Modulo7Props {
  datos: Record<string, any>;
  onChange: (campo: string, valor: string) => void;
}

// ── Componente ─────────────────────────────────────────────────────────────
export function Modulo7ValoracionDiagnosticos({ datos, onChange }: Modulo7Props) {
  function set(campo: string) {
    return (valor: string) => onChange(campo, valor);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          7. Valoración Médica y Diagnósticos
        </h2>
        <p className="text-sm text-slate-500">
          Impresión diagnóstica y clasificación de la consulta (RIPS — Res. 3374/2000).
        </p>
      </div>

      {/* Valoración médica — texto justificado en PDF */}
      <CampoTextarea
        label="Valoración Médica"
        value={datos.valoracion_medica}
        onChange={set("valoracion_medica")}
        rows={5}
      />

      {/* Diagnósticos CIE-10 — sin punto */}
      <div>
        <p className="text-xs text-slate-400 mb-2">
          Escriba el código CIE-10 sin punto (ej: <strong>M544</strong>) seguido del nombre.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <CampoTexto
            label="Diagnóstico Principal"
            value={datos.diagnostico_principal}
            onChange={set("diagnostico_principal")}
            placeholder="Ej: M544 Lumbago con ciática"
          />
          <CampoTexto
            label="Diagnóstico Relacionado 1"
            value={datos.diagnostico_relacionado_1}
            onChange={set("diagnostico_relacionado_1")}
            placeholder="Opcional"
          />
          <CampoTexto
            label="Diagnóstico Relacionado 2"
            value={datos.diagnostico_relacionado_2}
            onChange={set("diagnostico_relacionado_2")}
            placeholder="Opcional"
          />
          <CampoTexto
            label="Diagnóstico Relacionado 3"
            value={datos.diagnostico_relacionado_3}
            onChange={set("diagnostico_relacionado_3")}
            placeholder="Opcional"
          />
        </div>
      </div>

      {/* Clasificación de la consulta — listas RIPS */}
      <div className="grid grid-cols-2 gap-4">
        <CampoSelect
          label="Causa Externa"
          value={datos.causa_externa ?? ""}
          onChange={set("causa_externa")}
          opciones={CAUSAS_EXTERNAS}
        />
        <CampoSelect
          label="Tipo de Diagnóstico"
          value={datos.tipo_diagnostico ?? ""}
          onChange={set("tipo_diagnostico")}
          opciones={TIPOS_DIAGNOSTICO}
        />
      </div>

      <CampoSelect
        label="Finalidad de la Consulta"
        value={datos.finalidad ?? ""}
        onChange={set("finalidad")}
        opciones={FINALIDADES}
      />
    </div>
  );
}