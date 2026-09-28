﻿﻿import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { buscarHistorias, marcarTranscrita, obtenerAuditoria, exportarPendientesZip } from "../services/historias";
import type { HistoriaClinica } from "../services/historias";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";

interface MedicoOpcion {
  id: number;
  nombre_completo: string;
}

interface CambioAuditoria {
  id: number;
  accion: string;
  detalle?: string;
  fecha: string;
  medico_nombre?: string;
}

const ETIQUETAS_ACCION: Record<string, string> = {
  creada: "Creó la historia",
  editada: "Editó",
  finalizada: "Finalizó",
  marcada_transcrita: "Marcó como transcrita a PANA",
  desmarcada_transcrita: "Desmarcó transcrita a PANA",
  pdf_exportado: "Generó/descargó el PDF",
};

function formatearFecha(fechaIso: string) {
  const fecha = new Date(fechaIso);
  return fecha.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BuscarHistorias() {
  const { medico } = useAuth();
  const esAdmin = Boolean(medico?.es_admin);

  const [texto, setTexto] = useState("");
  const [medicoIdFiltro, setMedicoIdFiltro] = useState<string>("");
  const [soloPendientesTranscribir, setSoloPendientesTranscribir] = useState(false);
  const [medicos, setMedicos] = useState<MedicoOpcion[]>([]);
  const [resultados, setResultados] = useState<HistoriaClinica[]>([]);
  const [cargando, setCargando] = useState(false);
  const [descargandoId, setDescargandoId] = useState<number | null>(null);
  const [marcandoId, setMarcandoId] = useState<number | null>(null);
  const [exportandoZip, setExportandoZip] = useState(false);

  const [auditoriaAbiertaId, setAuditoriaAbiertaId] = useState<number | null>(null);
  const [auditoriaDatos, setAuditoriaDatos] = useState<CambioAuditoria[]>([]);
  const [cargandoAuditoria, setCargandoAuditoria] = useState(false);

  const navigate = useNavigate();

  async function buscar() {
    setCargando(true);
    try {
      const idFiltro = medicoIdFiltro ? Number(medicoIdFiltro) : undefined;
      const data = await buscarHistorias(texto, undefined, idFiltro);
      setResultados(data);
    } catch (error) {
      // silencioso
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (!esAdmin) return;
    api
      .get<MedicoOpcion[]>("/auth/medicos")
      .then((res) => setMedicos(res.data))
      .catch(() => {});
  }, [esAdmin]);

  useEffect(() => {
    buscar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicoIdFiltro]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    buscar();
  }

  async function verPdf(id: number) {
    setDescargandoId(id);
    try {
      const res = await api.get(`/historias/${id}/pdf`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      window.open(url, "_blank");
    } catch (error) {
      alert("No se pudo abrir el PDF. Verifica tu sesion e intenta de nuevo.");
    } finally {
      setDescargandoId(null);
    }
  }

  async function toggleTranscrita(historia: HistoriaClinica) {
    setMarcandoId(historia.id);
    try {
      const actualizada = await marcarTranscrita(historia.id, !historia.transcrita_a_pana);
      setResultados((prev) =>
        prev.map((h) => (h.id === historia.id ? { ...h, ...actualizada } : h))
      );
    } catch (error) {
      alert("No se pudo actualizar el estado de transcripción.");
    } finally {
      setMarcandoId(null);
    }
  }

  async function abrirAuditoria(id: number) {
    setAuditoriaAbiertaId(id);
    setCargandoAuditoria(true);
    try {
      const data = await obtenerAuditoria(id);
      setAuditoriaDatos(data);
    } catch (error) {
      setAuditoriaDatos([]);
    } finally {
      setCargandoAuditoria(false);
    }
  }

  function cerrarAuditoria() {
    setAuditoriaAbiertaId(null);
    setAuditoriaDatos([]);
  }

  async function handleExportarZip() {
    setExportandoZip(true);
    try {
      const idFiltro = medicoIdFiltro ? Number(medicoIdFiltro) : undefined;
      await exportarPendientesZip(idFiltro);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        alert("No hay historias pendientes de transcribir a PANA.");
      } else {
        alert("No se pudo generar el ZIP. Intenta de nuevo.");
      }
    } finally {
      setExportandoZip(false);
    }
  }

  const resultadosFiltrados = soloPendientesTranscribir
    ? resultados.filter((h) => h.estado === "completa" && !h.transcrita_a_pana)
    : resultados;

  return (
    <div className="h-screen flex bg-[#f5f7fa]">
      <Sidebar moduloActivo={0} onSeleccionar={() => navigate("/")} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-5 flex items-center justify-between gap-2">
              <h1 className="text-lg font-semibold text-slate-800 font-['Manrope']">
                Buscar Historias Clínicas
              </h1>
              <div className="flex gap-2">
                <button
                  onClick={handleExportarZip}
                  disabled={exportandoZip}
                  className="text-sm border border-slate-300 hover:bg-slate-50 disabled:opacity-60 text-slate-700 px-4 py-2 rounded-lg transition-all"
                  title="Descarga un ZIP con los PDF de historias completas aún no transcritas a PANA"
                >
                  {exportandoZip ? "Generando..." : "Exportar pendientes (ZIP)"}
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="text-sm bg-[#14375e] hover:bg-[#0f2c4c] active:scale-[0.98] text-white px-4 py-2 rounded-lg transition-all"
                >
                  + Nueva Historia
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Buscar por cédula o nombre del paciente..."
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e86ab] focus:border-transparent transition-shadow"
                />
              </div>
              <button
                type="submit"
                className="bg-[#14375e] hover:bg-[#0f2c4c] active:scale-[0.98] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all"
              >
                Buscar
              </button>
            </form>

            <div className="mb-6 flex flex-wrap items-center gap-4">
              {esAdmin && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    Filtrar por médico
                  </label>
                  <select
                    value={medicoIdFiltro}
                    onChange={(e) => setMedicoIdFiltro(e.target.value)}
                    className="w-full sm:w-72 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2e86ab] focus:border-transparent transition-shadow bg-white"
                  >
                    <option value="">Todos los médicos</option>
                    {medicos.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre_completo}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <label className="flex items-center gap-2 text-sm text-slate-600 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={soloPendientesTranscribir}
                  onChange={(e) => setSoloPendientesTranscribir(e.target.checked)}
                  className="rounded border-slate-300 text-[#14375e] focus:ring-[#2e86ab]"
                />
                Solo pendientes de transcribir a PANA
              </label>
            </div>

            {cargando && (
              <p className="text-sm text-slate-400 text-center py-8">
                Buscando...
              </p>
            )}

            {!cargando && resultadosFiltrados.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8 border border-dashed border-slate-300 rounded-xl">
                No se encontraron historias.
              </p>
            )}

            <div className="space-y-2.5">
              {resultadosFiltrados.map((historia) => (
                <div
                  key={historia.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 transition-all"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {historia.paciente_nombre || "(Sin nombre)"}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {historia.paciente_tipo_identificacion || "ID"}: {historia.paciente_cedula || "-"} &nbsp;·&nbsp;
                      Fecha: {formatearFecha(historia.fecha_atencion)}
                      {esAdmin && historia.medico_nombre && (
                        <>
                          &nbsp;·&nbsp;Médico: {historia.medico_nombre}
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        historia.estado === "completa"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {historia.estado === "completa" ? "Completa" : "Borrador"}
                    </span>

                    {historia.estado === "completa" && (
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          historia.transcrita_a_pana
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {historia.transcrita_a_pana ? "Transcrita a PANA" : "Pendiente PANA"}
                      </span>
                    )}

                    {historia.estado === "completa" && (
                      <button
                        onClick={() => toggleTranscrita(historia)}
                        disabled={marcandoId === historia.id}
                        className="text-xs bg-slate-100 hover:bg-slate-200 disabled:opacity-60 text-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {marcandoId === historia.id
                          ? "..."
                          : historia.transcrita_a_pana
                          ? "Desmarcar"
                          : "Marcar transcrita"}
                      </button>
                    )}

                    <button
                      onClick={() => abrirAuditoria(historia.id)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Historial
                    </button>

                    <button
                      onClick={() => verPdf(historia.id)}
                      disabled={descargandoId === historia.id}
                      className="text-xs bg-slate-100 hover:bg-slate-200 disabled:opacity-60 text-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {descargandoId === historia.id ? "Abriendo..." : "Ver PDF"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {auditoriaAbiertaId !== null && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={cerrarAuditoria}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Historial — Historia #{auditoriaAbiertaId}
              </h3>
              <button
                onClick={cerrarAuditoria}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            {cargandoAuditoria && (
              <p className="text-sm text-slate-400 text-center py-6">Cargando...</p>
            )}

            {!cargandoAuditoria && auditoriaDatos.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">
                Sin registros de auditoría.
              </p>
            )}

            <ul className="space-y-3">
              {auditoriaDatos.map((c) => (
                <li key={c.id} className="text-sm border-l-2 border-[#2e86ab] pl-3">
                  <p className="text-slate-800 font-medium">
                    {ETIQUETAS_ACCION[c.accion] || c.accion}
                  </p>
                  <p className="text-xs text-slate-500">
                    {c.medico_nombre || "—"} · {formatearFecha(c.fecha)}
                    {c.detalle && <> · {c.detalle}</>}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}