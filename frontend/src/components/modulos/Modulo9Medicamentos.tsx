interface Modulo9Props {
  datos: Record<string, any>;
  onChange: (campo: string, valor: any) => void;
}

export function Modulo9Medicamentos({}: Modulo9Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          9. Medicamentos y Recomendaciones
        </h2>
        <p className="text-sm text-slate-500">
          La formulacion y las ordenes se diligencian en los formatos manuales.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => window.open("/formula-medica-manual.pdf", "_blank")}
          className="text-sm bg-[#14375e] hover:bg-[#0f2c4c] active:scale-[0.98] text-white px-4 py-2.5 rounded-lg transition-all"
        >
          Formula Manual (PDF)
        </button>
        <button
          type="button"
          onClick={() => window.open("/formato-manual-ordenes.pdf", "_blank")}
          className="text-sm bg-[#14375e] hover:bg-[#0f2c4c] active:scale-[0.98] text-white px-4 py-2.5 rounded-lg transition-all"
        >
          Formato Manual Ordenes (PDF)
        </button>
      </div>
    </div>
  );
}