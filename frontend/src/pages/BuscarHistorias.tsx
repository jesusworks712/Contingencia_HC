import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { buscarHistorias } from "../services/historias";
import type { HistoriaClinica } from "../services/historias";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";

interface MedicoOpcion {
  id: number;
  nombre_completo: string;
}

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
  const [medicos, setMedicos] = useState<MedicoOpcion[]>([]);
  const [resultados, setResultados] = useState<HistoriaClinica[]>([]);
  const [cargando, setCargando] = useState(false);
  const [descargandoId, setDescargandoId] = useState<number | null>(null);
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

  // Si es administrador, cargamos la lista de medicos para el filtro.
  useEffect(() => {
    if (!esAdmin) return;
    api
      .get<MedicoOpcion[]>("/auth/medicos")
      .then((res) => setMedicos(res.data))
      .catch(() => {
        // silencioso: si falla, simplemente no se muestra el filtro
      });
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

  return (
    <div className="h-screen flex bg-[#f5f7fa]">
      <Sidebar moduloActivo={0} onSeleccionar={() => navigate("/")} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-5 flex items-center justify-between">
              <h1 className="text-lg font-semibold text-slate-800 font-['Manrope']">
                Buscar Historias Clínicas
              </h1>
              <button
                onClick={() => navigate("/")}
                className="text-sm bg-[#14375e] hover:bg-[#0f2c4c] active:scale-[0.98] text-white px-4 py-2 rounded-lg transition-all"
              >
                + Nueva Historia
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
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

            {esAdmin && (
              <div className="mb-6 -mt-3">
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

            {cargando && (
              <p className="text-sm text-slate-400 text-center py-8">
                Buscando...
              </p>
            )}

            {!cargando && resultados.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8 border border-dashed border-slate-300 rounded-xl">
                No se encontraron historias.
              </p>
            )}

            <div className="space-y-2.5">
              {resultados.map((historia) => (
                <div
                  key={historia.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 transition-all"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {historia.paciente_nombre || "(Sin nombre)"}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Cédula: {historia.paciente_cedula || "-"} &nbsp;·&nbsp;
                      Fecha: {formatearFecha(historia.fecha_atencion)}
                      {esAdmin && historia.medico_nombre && (
                        <>
                          &nbsp;·&nbsp;Médico: {historia.medico_nombre}
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        historia.estado === "completa"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {historia.estado === "completa" ? "Completa" : "Borrador"}
                    </span>

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
    </div>
  );
}