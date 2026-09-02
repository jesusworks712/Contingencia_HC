interface CampoTextoProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}

export function CampoTexto({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  className = "",
}: CampoTextoProps) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2e86ab] focus:border-transparent transition-shadow"
      />
    </div>
  );
}

interface CampoTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  className?: string;
}

export function CampoTextarea({
  label,
  value,
  onChange,
  rows = 4,
  className = "",
}: CampoTextareaProps) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        {label}
      </label>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2e86ab] focus:border-transparent transition-shadow resize-none"
      />
    </div>
  );
}

interface CampoSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  opciones: string[];
  className?: string;
}

export function CampoSelect({
  label,
  value,
  onChange,
  opciones,
  className = "",
}: CampoSelectProps) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        {label}
      </label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2e86ab] focus:border-transparent transition-shadow bg-white"
      >
        <option value="">Seleccione...</option>
        {opciones.map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>
    </div>
  );
}