/**
 * CampoCups — campo de búsqueda con autocompletado sobre el catálogo CUPS.
 *
 * Uso:
 *   <CampoCups
 *     label="Solicitudes de apoyo diagnóstico"
 *     seleccionados={lista}
 *     onChange={(lista) => onChange("apoyo_diagnostico_cups", lista)}
 *   />
 *
 * Cada ítem seleccionado queda como { codigo, nombre, cantidad, observacion }.
 */

import { useState, useEffect, useRef } from "react";

// ── Tipos ──────────────────────────────────────────────────────────────────
export interface ItemCups {
  codigo: string;
  nombre: string;
  cantidad: number;
  observacion: string;
}

interface CupsCatalogo {
  codigo: string;
  nombre: string;
}

interface CampoCupsProps {
  label: string;
  seleccionados: ItemCups[];
  onChange: (items: ItemCups[]) => void;
}

// ── Carga del catálogo (singleton, se carga una sola vez) ──────────────────
let _catalogoCache: CupsCatalogo[] | null = null;

async function cargarCatalogo(): Promise<CupsCatalogo[]> {
  if (_catalogoCache) return _catalogoCache;
  const res = await fetch("/cups.json");
  _catalogoCache = await res.json();
  return _catalogoCache!;
}

function buscarCups(catalogo: CupsCatalogo[], query: string): CupsCatalogo[] {
  if (!query || query.length < 2) return [];
  const q = query.toUpperCase().trim();
  const results: CupsCatalogo[] = [];
  for (const c of catalogo) {
    if (
      c.codigo.startsWith(q) ||
      c.nombre.includes(q)
    ) {
      results.push(c);
      if (results.length >= 10) break;
    }
  }
  return results;
}

// ── Componente ─────────────────────────────────────────────────────────────
export function CampoCups({ label, seleccionados, onChange }: CampoCupsProps) {
  const [catalogo, setCatalogo] = useState<CupsCatalogo[]>([]);
  const [query, setQuery] = useState("");
  const [sugerencias, setSugerencias] = useState<CupsCatalogo[]>([]);
  const [abierto, setAbierto] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    cargarCatalogo().then(setCatalogo);
  }, []);

  useEffect(() => {
    setSugerencias(buscarCups(catalogo, query));
    setAbierto(query.length >= 2);
  }, [query, catalogo]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        !inputRef.current?.contains(e.target as Node) &&
        !listaRef.current?.contains(e.target as Node)
      ) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function seleccionar(cups: CupsCatalogo) {
    // Evitar duplicados
    if (seleccionados.some((s) => s.codigo === cups.codigo)) {
      setQuery("");
      setAbierto(false);
      return;
    }
    const nuevo: ItemCups = {
      codigo: cups.codigo,
      nombre: cups.nombre,
      cantidad: 1,
      observacion: "",
    };
    onChange([...seleccionados, nuevo]);
    setQuery("");
    setAbierto(false);
    inputRef.current?.focus();
  }

  function eliminar(codigo: string) {
    onChange(seleccionados.filter((s) => s.codigo !== codigo));
  }

  function actualizarItem(
    codigo: string,
    campo: "cantidad" | "observacion",
    valor: string | number
  ) {
    onChange(
      seleccionados.map((s) =>
        s.codigo === codigo ? { ...s, [campo]: valor } : s
      )
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label */}
      <label className="text-sm font-medium text-slate-700">{label}</label>

      {/* Input de búsqueda */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setAbierto(true)}
          placeholder="Escriba código o nombre del procedimiento…"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800
                     placeholder:text-slate-400 focus:border-[#14375e] focus:outline-none
                     focus:ring-2 focus:ring-[#14375e]/20 transition-all"
        />

        {/* Dropdown de sugerencias */}
        {abierto && sugerencias.length > 0 && (
          <ul
            ref={listaRef}
            className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg border
                       border-slate-200 bg-white shadow-lg text-sm"
          >
            {sugerencias.map((c) => (
              <li
                key={c.codigo}
                onMouseDown={() => seleccionar(c)}
                className="flex gap-2 cursor-pointer px-3 py-2 hover:bg-[#14375e]/10
                           border-b border-slate-100 last:border-0"
              >
                <span className="font-mono text-[#14375e] font-semibold shrink-0">
                  {c.codigo}
                </span>
                <span className="text-slate-700 leading-snug">
                  {c.nombre.length > 80
                    ? c.nombre.slice(0, 80) + "…"
                    : c.nombre}
                </span>
              </li>
            ))}
          </ul>
        )}

        {abierto && query.length >= 2 && sugerencias.length === 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200
                          bg-white shadow-lg px-3 py-2 text-sm text-slate-400">
            Sin resultados para «{query}»
          </div>
        )}
      </div>

      {/* Tabla de ítems seleccionados */}
      {seleccionados.length > 0 && (
        <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-[#14375e] text-white">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Código</th>
                <th className="px-3 py-2 text-left font-semibold">Nombre</th>
                <th className="px-3 py-2 text-center font-semibold w-20">Cant.</th>
                <th className="px-3 py-2 text-left font-semibold">Observación</th>
                <th className="px-3 py-2 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {seleccionados.map((item, i) => (
                <tr
                  key={item.codigo}
                  className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
                >
                  <td className="px-3 py-1.5 font-mono text-[#14375e] font-semibold">
                    {item.codigo}
                  </td>
                  <td className="px-3 py-1.5 text-slate-700 max-w-xs leading-snug">
                    {item.nombre}
                  </td>
                  <td className="px-3 py-1.5 text-center">
                    <input
                      type="number"
                      min={1}
                      value={item.cantidad}
                      onChange={(e) =>
                        actualizarItem(
                          item.codigo,
                          "cantidad",
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      className="w-14 text-center rounded border border-slate-300 px-1 py-0.5
                                 text-sm focus:border-[#14375e] focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <input
                      type="text"
                      value={item.observacion}
                      placeholder="Opcional…"
                      onChange={(e) =>
                        actualizarItem(item.codigo, "observacion", e.target.value)
                      }
                      className="w-full rounded border border-slate-300 px-2 py-0.5 text-sm
                                 focus:border-[#14375e] focus:outline-none"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => eliminar(item.codigo)}
                      title="Quitar"
                      className="text-slate-400 hover:text-red-500 transition-colors text-base
                                 leading-none font-bold"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}