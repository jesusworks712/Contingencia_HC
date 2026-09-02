import { CampoTexto } from "../Campos";

interface Modulo5Props {
  valor: Record<string, any>;
  onChange: (nuevoValor: Record<string, any>) => void;
}

const CAMPOS: { key: string; label: string; placeholder?: string }[] = [
  { key: "temperatura", label: "Temperatura", placeholder: "°C" },
  { key: "tension_arterial", label: "Tension Arterial", placeholder: "Ej: 120/80" },
  { key: "frecuencia_cardiaca", label: "Frecuencia Cardiaca", placeholder: "lpm" },
  { key: "peso", label: "Peso", placeholder: "kg" },
  { key: "altura", label: "Altura", placeholder: "cm" },
  { key: "frecuencia_respiratoria", label: "Frecuencia Respiratoria", placeholder: "rpm" },
  { key: "indice_masa_muscular", label: "Indice Masa Muscular" },
  { key: "clasificacion_imc", label: "Clasificacion IMC" },
  { key: "circunferencia_abdominal", label: "Circunferencia Abdominal", placeholder: "cm" },
  { key: "perimetro_cefalico", label: "Perimetro Cefalico", placeholder: "cm" },
  { key: "perimetro_branquial", label: "Perimetro Branquial", placeholder: "cm" },
  { key: "pliegue_tricipital", label: "Pliegue Tricipital" },
  { key: "pliegue_subescapular", label: "Pliegue Subescapular" },
  { key: "diametro_muneca", label: "Diámetro Muñeca" },
];

export function Modulo5SignosVitales({ valor, onChange }: Modulo5Props) {
  const datosJson = valor || {};

  function setCampo(campo: string, texto: string) {
    onChange({ ...datosJson, [campo]: texto });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          5. Signos Vitales
        </h2>
        <p className="text-sm text-slate-500">
          Mediciones tomadas durante la consulta.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {CAMPOS.map((campo) => (
          <CampoTexto
            key={campo.key}
            label={campo.label}
            placeholder={campo.placeholder}
            value={datosJson[campo.key] || ""}
            onChange={(v) => setCampo(campo.key, v)}
          />
        ))}
      </div>
    </div>
  );
} 