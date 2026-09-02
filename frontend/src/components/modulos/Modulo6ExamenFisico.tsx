import { CampoTexto } from "../Campos";

interface Modulo6Props {
  valor: Record<string, any>;
  onChange: (nuevoValor: Record<string, any>) => void;
}

const CAMPOS: { key: string; label: string }[] = [
  { key: "cabeza", label: "Cabeza" },
  { key: "cara", label: "Cara" },
  { key: "boca", label: "Boca" },
  { key: "cuello", label: "Cuello" },
  { key: "torax", label: "Torax" },
  { key: "abdomen", label: "Abdomen" },
  { key: "extremidad", label: "Extremidad" },
  { key: "vascular", label: "Vascular" },
  { key: "neurologico", label: "Neurologico" },
  { key: "columna", label: "Columna" },
  { key: "examen_fisico_segmentario", label: "Examen Fisico Segmentario" },
  { key: "orl", label: "ORL" },
  { key: "mamas", label: "Mamas" },
  { key: "genitourinario", label: "Genitourinario" },
];

export function Modulo6ExamenFisico({ valor, onChange }: Modulo6Props) {
  const datosJson = valor || {};

  function setCampo(campo: string, texto: string) {
    onChange({ ...datosJson, [campo]: texto });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          6. Examen Fisico Segmentario
        </h2>
        <p className="text-sm text-slate-500">
          Hallazgos por segmento corporal.
        </p>
      </div>

      <div className="space-y-3">
        {CAMPOS.map((campo) => (
          <CampoTexto
            key={campo.key}
            label={campo.label}
            value={datosJson[campo.key] || ""}
            onChange={(v) => setCampo(campo.key, v)}
          />
        ))}
      </div>
    </div>
  );
}