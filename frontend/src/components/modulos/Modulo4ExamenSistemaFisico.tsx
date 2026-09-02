import { CampoTexto, CampoTextarea } from "../Campos";

interface Modulo4Props {
  valor: Record<string, any>;
  onChange: (nuevoValor: Record<string, any>) => void;
}

const CAMPOS_SIMPLES: { key: string; label: string }[] = [
  { key: "cabeza", label: "Cabeza" },
  { key: "cara", label: "Cara" },
  { key: "nariz_senos_paranasales", label: "Nariz y Senos Paranasales" },
  { key: "oidos", label: "Oidos" },
  { key: "cavidad_oral", label: "Cavidad Oral" },
  { key: "cuello", label: "Cuello" },
  { key: "respiratorio", label: "Respiratorio" },
  { key: "cardiovascular", label: "Cardiovascular" },
  { key: "mamas", label: "Mamas" },
  { key: "gastro_intestinal", label: "Gastro Intestinal" },
  { key: "genito_urinario", label: "Genito Urinario" },
  { key: "musculo_esqueletico", label: "Musculo Esqueletico" },
  { key: "sistema_nervioso", label: "Sistema Nervioso" },
  { key: "hematopoyetico", label: "Hematopoyetico" },
  { key: "endocrino", label: "Endocrino" },
  { key: "piel", label: "Piel" },
];

export function Modulo4ExamenSistemaFisico({ valor, onChange }: Modulo4Props) {
  const datosJson = valor || {};

  function setCampo(campo: string, texto: string) {
    onChange({ ...datosJson, [campo]: texto });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          4. Examen Sistema Fisico
        </h2>
        <p className="text-sm text-slate-500">
          Revision por sistemas del paciente.
        </p>
      </div>

      <div className="space-y-3">
        {CAMPOS_SIMPLES.map((campo) => (
          <CampoTexto
            key={campo.key}
            label={campo.label}
            value={datosJson[campo.key] || ""}
            onChange={(v) => setCampo(campo.key, v)}
          />
        ))}
      </div>

      <CampoTextarea
        label="Observaciones / Detalles"
        value={datosJson.observaciones_detalles || ""}
        onChange={(v) => setCampo("observaciones_detalles", v)}
        rows={3}
      />
    </div>
  );
}