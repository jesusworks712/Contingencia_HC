const MODULOS = [
  "Identificacion",
  "Datos de Atencion",
  "Antecedentes",
  "Examen Sistema Fisico",
  "Signos Vitales",
  "Examen Fisico Segmentario",
  "Valoracion Medica",
  "Diagnosticos / Incapacidad",
  "Medicamentos / Recomendaciones",
];

interface SidebarProps {
  moduloActivo: number;
  onSeleccionar: (numero: number) => void;
}

export function Sidebar({ moduloActivo, onSeleccionar }: SidebarProps) {
  return (
    <aside className="w-64 bg-[#0d2540] text-white flex flex-col shrink-0">
      <div className="p-4 border-b border-white/10 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#14375e] flex items-center justify-center shrink-0">
          <span className="text-white text-sm font-bold">+</span>
        </div>
        <div>
          <h2 className="font-bold text-sm leading-tight font-['Manrope']">
            Historia Clínica
          </h2>
          <p className="text-xs text-white/50">Modo Contingencia</p>
        </div>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {MODULOS.map((nombre, index) => {
          const numero = index + 1;
          const activo = numero === moduloActivo;
          // Un modulo se considera "visitado" si el medico ya avanzo mas
          // alla de el; se marca con un check, igual que en el diseno de
          // referencia, sin necesitar seguimiento de estado adicional.
          const visitado = numero < moduloActivo;

          let circuloClases =
            "w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0 font-mono-ids ";
          if (activo) {
            circuloClases += "bg-white text-[#14375e]";
          } else if (visitado) {
            circuloClases += "bg-emerald-400 text-[#0d2540] font-bold";
          } else {
            circuloClases += "bg-white/10 text-white/70";
          }

          return (
            <button
              key={numero}
              onClick={() => onSeleccionar(numero)}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                activo
                  ? "bg-[#14375e] text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white/90"
              }`}
            >
              <span className={circuloClases}>{visitado && !activo ? "✓" : numero}</span>
              {nombre}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400 pulse-alert shrink-0" />
          <div>
            <p className="text-[11px] font-semibold text-red-300 leading-none">
              MODO CONTINGENCIA
            </p>
            <p className="text-[10px] text-red-300/70 mt-0.5">Sin conexión</p>
          </div>
        </div>
      </div>
    </aside>
  );
}