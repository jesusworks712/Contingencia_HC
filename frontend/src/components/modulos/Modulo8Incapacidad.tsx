interface Modulo8Props {
  datos: Record<string, any>;
  onChange: (campo: string, valor: any) => void;
}

export function Modulo8Incapacidad({}: Modulo8Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          8. Incapacidad y Apoyo Diagnostico
        </h2>
        <p className="text-sm text-slate-500">
          La incapacidad se diligencia en el formato manual editable.
        </p>
      </div>

      <button
        type="button"
        onClick={() => window.open("/formato-manual-incapacidad.pdf", "_blank")}
        className="text-sm bg-[#14375e] hover:bg-[#0f2c4c] active:scale-[0.98] text-white px-4 py-2.5 rounded-lg transition-all"
      >
        Generar Incapacidad (PDF)
      </button>
    </div>
  );
}