# Rediseno visual completo: paleta teal, tipografia Manrope, firma (linea vitales + pulso)
Write-Host "Aplicando rediseno visual..." -ForegroundColor Cyan

Write-Host "Actualizando src\index.css..." -ForegroundColor Green
@'
@import "tailwindcss";

@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap');

:root {
  --color-ink: #0f2a28;
  --color-ink-2: #17403d;
  --color-primary: #0f6e63;
  --color-primary-dark: #0b5850;
  --color-primary-light: #e6f3f1;
}

body {
  font-family: 'Manrope', system-ui, sans-serif;
  background-color: #f6f8f8;
}

.font-mono-ids {
  font-family: 'JetBrains Mono', monospace;
}

@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.5); }
  50% { box-shadow: 0 0 0 6px rgba(220, 38, 38, 0); }
}

.pulse-alert {
  animation: pulse-dot 2s ease-in-out infinite;
}
'@ | Set-Content -Path "src\index.css" -Encoding UTF8

Write-Host "Actualizando src\pages\Login.tsx..." -ForegroundColor Green
@'
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      await login(usuario, password);
      navigate("/");
    } catch (err: any) {
      if (!err.response) {
        setError(
          "No se pudo conectar con el servidor. Verifica que este encendido y que estas en la red correcta."
        );
      } else if (err.response.status === 401) {
        setError("Usuario o contraseña incorrectos");
      } else {
        setError("Error inesperado. Intenta de nuevo.");
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[#0f2a28]">
      {/* Fondo con textura sutil tipo linea de vitales */}
      <svg
        className="absolute inset-x-0 bottom-0 w-full opacity-[0.08]"
        height="180"
        viewBox="0 0 1200 180"
        preserveAspectRatio="none"
      >
        <path
          d="M0,90 L280,90 L310,20 L340,160 L370,90 L900,90 L930,40 L960,140 L990,90 L1200,90"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
        />
      </svg>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative z-10">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-xl mx-auto mb-3 flex items-center justify-center bg-[#0f6e63]">
            <span className="text-white text-2xl font-bold">+</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Sistema de Historia Clinica
          </h1>
          <p className="text-sm text-[#0f6e63] font-medium mt-1">
            Modo Contingencia · Sin Conexion
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Usuario
            </label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f6e63] focus:border-transparent transition"
              placeholder="Ingrese su usuario"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f6e63] focus:border-transparent transition"
              placeholder="Ingrese su contraseña"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-[#0f6e63] hover:bg-[#0b5850] disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 text-sm transition"
          >
            {cargando ? "Ingresando..." : "Iniciar Sesion"}
          </button>
        </form>

        <div className="flex items-center justify-center gap-2 mt-6">
          <span className="w-2 h-2 rounded-full bg-red-500 pulse-alert" />
          <p className="text-xs text-slate-400">
            El sistema funciona sin conexion. Los datos se guardan localmente.
          </p>
        </div>
      </div>
    </div>
  );
}
'@ | Set-Content -Path "src\pages\Login.tsx" -Encoding UTF8

Write-Host "Actualizando src\components\Sidebar.tsx..." -ForegroundColor Green
@'
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
    <aside className="w-64 bg-[#0f2a28] text-white flex flex-col shrink-0">
      <div className="p-4 border-b border-white/10 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#0f6e63] flex items-center justify-center shrink-0">
          <span className="text-white text-sm font-bold">+</span>
        </div>
        <div>
          <h2 className="font-bold text-sm leading-tight">Historia Clinica</h2>
          <p className="text-xs text-white/50">Modo Contingencia</p>
        </div>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {MODULOS.map((nombre, index) => {
          const numero = index + 1;
          const activo = numero === moduloActivo;
          return (
            <button
              key={numero}
              onClick={() => onSeleccionar(numero)}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition ${
                activo
                  ? "bg-[#0f6e63] text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white/90"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0 font-mono-ids ${
                  activo ? "bg-white text-[#0f6e63]" : "bg-white/10"
                }`}
              >
                {numero}
              </span>
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
            <p className="text-[10px] text-red-300/70 mt-0.5">Sin conexion</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
'@ | Set-Content -Path "src\components\Sidebar.tsx" -Encoding UTF8

Write-Host "Actualizando src\components\Header.tsx..." -ForegroundColor Green
@'
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export function Header() {
  const { medico, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-6">
        <h1 className="text-sm font-semibold text-slate-800">
          Historia Clinica - Consulta Externa
        </h1>
        <nav className="flex items-center gap-1">
          <button
            onClick={() => navigate("/")}
            className={`text-xs px-3 py-1.5 rounded-lg transition font-medium ${
              location.pathname === "/"
                ? "bg-[#e6f3f1] text-[#0f6e63]"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Nueva Historia
          </button>
          <button
            onClick={() => navigate("/buscar")}
            className={`text-xs px-3 py-1.5 rounded-lg transition font-medium ${
              location.pathname === "/buscar"
                ? "bg-[#e6f3f1] text-[#0f6e63]"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Buscar Historias
          </button>
          {medico?.es_admin && (
            <button
              onClick={() => navigate("/medicos")}
              className={`text-xs px-3 py-1.5 rounded-lg transition font-medium ${
                location.pathname === "/medicos"
                  ? "bg-[#e6f3f1] text-[#0f6e63]"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              Medicos
            </button>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-800">
            {medico?.nombre_completo}
            {medico?.es_admin && (
              <span className="ml-2 text-[10px] bg-[#e6f3f1] text-[#0f6e63] px-1.5 py-0.5 rounded-full align-middle font-semibold">
                ADMIN
              </span>
            )}
          </p>
          <p className="text-xs text-slate-500 font-mono-ids">
            Reg. Medico: {medico?.registro_medico}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-slate-500 hover:text-red-600 border border-slate-300 hover:border-red-300 rounded-lg px-3 py-1.5 transition"
        >
          Cerrar sesion
        </button>
      </div>
    </header>
  );
}
'@ | Set-Content -Path "src\components\Header.tsx" -Encoding UTF8

Write-Host "Actualizando src\components\Campos.tsx..." -ForegroundColor Green
@'
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
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f6e63] focus:border-transparent transition"
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
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f6e63] focus:border-transparent transition resize-none"
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
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f6e63] focus:border-transparent transition bg-white"
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
'@ | Set-Content -Path "src\components\Campos.tsx" -Encoding UTF8

Write-Host "Actualizando src\pages\Dashboard.tsx..." -ForegroundColor Green
@'
import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { Modulo1Identificacion } from "../components/modulos/Modulo1Identificacion";
import { Modulo2DatosAtencion } from "../components/modulos/Modulo2DatosAtencion";
import { Modulo3Antecedentes } from "../components/modulos/Modulo3Antecedentes";
import { Modulo4ExamenSistemaFisico } from "../components/modulos/Modulo4ExamenSistemaFisico";
import { Modulo5SignosVitales } from "../components/modulos/Modulo5SignosVitales";
import { Modulo6ExamenFisico } from "../components/modulos/Modulo6ExamenFisico";
import { Modulo7ValoracionDiagnosticos } from "../components/modulos/Modulo7ValoracionDiagnosticos";
import { Modulo8Incapacidad } from "../components/modulos/Modulo8Incapacidad";
import { Modulo9Medicamentos } from "../components/modulos/Modulo9Medicamentos";
import {
  crearHistoria,
  actualizarHistoria,
  finalizarHistoria,
} from "../services/historias";

const TOTAL_MODULOS = 9;

export default function Dashboard() {
  const [moduloActivo, setModuloActivo] = useState(1);
  const [historiaId, setHistoriaId] = useState<number | null>(null);
  const [datos, setDatos] = useState<Record<string, any>>({});
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [historiaFinalizada, setHistoriaFinalizada] = useState(false);

  function actualizarCampo(campo: string, valor: any) {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
  }

  async function guardarSinAvanzar(): Promise<number | null> {
    try {
      if (!historiaId) {
        const nueva = await crearHistoria({ ...datos, modulo_actual: moduloActivo });
        setHistoriaId(nueva.id);
        return nueva.id;
      } else {
        await actualizarHistoria(historiaId, { ...datos, modulo_actual: moduloActivo });
        return historiaId;
      }
    } catch (error: any) {
      if (!error.response) {
        setMensaje(
          "Error: No se pudo conectar con el servidor. Verifica que este encendido y vuelve a intentar. Tus datos siguen en pantalla, no se perdieron."
        );
      } else if (error.response.status === 400) {
        setMensaje(`Error: ${error.response.data?.detail || "Datos invalidos"}`);
      } else if (error.response.status === 401) {
        setMensaje("Tu sesion expiro. Vuelve a iniciar sesion.");
      } else {
        setMensaje("Error inesperado al guardar. Intenta de nuevo en unos segundos.");
      }
      return null;
    }
  }

  async function guardarYAvanzar() {
    setGuardando(true);
    setMensaje(null);

    const idGuardado = await guardarSinAvanzar();

    if (idGuardado) {
      setMensaje("Guardado correctamente");
      if (moduloActivo < TOTAL_MODULOS) {
        setModuloActivo(moduloActivo + 1);
      }
      setTimeout(() => setMensaje(null), 3000);
    }

    setGuardando(false);
  }

  async function handleFinalizar() {
    const confirmado = window.confirm(
      "Vas a finalizar esta historia clinica. Una vez finalizada no se podra editar. ¿Deseas continuar?"
    );
    if (!confirmado) return;

    setGuardando(true);
    setMensaje(null);

    const idGuardado = await guardarSinAvanzar();

    if (idGuardado) {
      try {
        await finalizarHistoria(idGuardado);
        setHistoriaFinalizada(true);
        setMensaje("Historia finalizada correctamente");
      } catch (error) {
        setMensaje("Error al finalizar la historia. Intenta de nuevo.");
      }
    }

    setGuardando(false);
  }

  function nuevaHistoria() {
    setHistoriaId(null);
    setDatos({});
    setModuloActivo(1);
    setHistoriaFinalizada(false);
    setMensaje(null);
  }

  function renderModulo() {
    switch (moduloActivo) {
      case 1:
        return <Modulo1Identificacion datos={datos} onChange={actualizarCampo} />;
      case 2:
        return <Modulo2DatosAtencion datos={datos} onChange={actualizarCampo} />;
      case 3:
        return <Modulo3Antecedentes datos={datos} onChange={actualizarCampo} />;
      case 4:
        return (
          <Modulo4ExamenSistemaFisico
            valor={datos.examen_sistema_fisico}
            onChange={(nuevoValor) => actualizarCampo("examen_sistema_fisico", nuevoValor)}
          />
        );
      case 5:
        return (
          <Modulo5SignosVitales
            valor={datos.signos_vitales}
            onChange={(nuevoValor) => actualizarCampo("signos_vitales", nuevoValor)}
          />
        );
      case 6:
        return (
          <Modulo6ExamenFisico
            valor={datos.examen_fisico}
            onChange={(nuevoValor) => actualizarCampo("examen_fisico", nuevoValor)}
          />
        );
      case 7:
        return <Modulo7ValoracionDiagnosticos datos={datos} onChange={actualizarCampo} />;
      case 8:
        return <Modulo8Incapacidad datos={datos} onChange={actualizarCampo} />;
      case 9:
        return <Modulo9Medicamentos datos={datos} onChange={actualizarCampo} />;
      default:
        return null;
    }
  }

  if (historiaFinalizada) {
    return (
      <div className="h-screen flex bg-slate-50">
        <Sidebar moduloActivo={moduloActivo} onSeleccionar={() => {}} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="bg-white rounded-xl border border-slate-200 p-10 max-w-md text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-green-600 text-2xl">✓</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-800 mb-1">
                Historia Finalizada
              </h2>
              <p className="text-sm text-slate-500 mb-1">
                Historia #{historiaId} guardada correctamente.
              </p>
              <p className="text-xs text-slate-400 mb-6">
                Ya puedes buscarla y generar su PDF cuando lo necesites.
              </p>
              <button
                onClick={nuevaHistoria}
                className="bg-[#0f6e63] hover:bg-[#0b5850] text-white text-sm font-medium rounded-lg px-5 py-2.5 transition"
              >
                Crear nueva historia
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-slate-50">
      <Sidebar moduloActivo={moduloActivo} onSeleccionar={setModuloActivo} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-4xl">
            {renderModulo()}

            <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-200">
              <div>
                {mensaje && (
                  <p
                    className={`text-sm ${
                      mensaje.includes("Error")
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {mensaje}
                  </p>
                )}
                {historiaId && (
                  <p className="text-xs text-slate-400 mt-1">
                    Historia #{historiaId}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {moduloActivo > 1 && (
                  <button
                    onClick={() => setModuloActivo(moduloActivo - 1)}
                    className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition"
                  >
                    Anterior
                  </button>
                )}

                {moduloActivo < TOTAL_MODULOS && (
                  <button
                    onClick={guardarYAvanzar}
                    disabled={guardando}
                    className="px-5 py-2 text-sm bg-[#0f6e63] hover:bg-[#0b5850] disabled:opacity-60 text-white rounded-lg font-medium transition"
                  >
                    {guardando ? "Guardando..." : "Guardar y Siguiente"}
                  </button>
                )}

                {moduloActivo === TOTAL_MODULOS && (
                  <>
                    <button
                      onClick={guardarYAvanzar}
                      disabled={guardando}
                      className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-60 transition"
                    >
                      Guardar borrador
                    </button>
                    <button
                      onClick={handleFinalizar}
                      disabled={guardando}
                      className="px-5 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg font-medium transition"
                    >
                      {guardando ? "Procesando..." : "Finalizar Historia"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
'@ | Set-Content -Path "src\pages\Dashboard.tsx" -Encoding UTF8

Write-Host "Actualizando src\pages\BuscarHistorias.tsx..." -ForegroundColor Green
@'
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { buscarHistorias } from "../services/historias";
import type { HistoriaClinica } from "../services/historias";
import { api } from "../api/axios";

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
  const [texto, setTexto] = useState("");
  const [resultados, setResultados] = useState<HistoriaClinica[]>([]);
  const [cargando, setCargando] = useState(false);
  const [descargandoId, setDescargandoId] = useState<number | null>(null);
  const navigate = useNavigate();

  async function buscar() {
    setCargando(true);
    try {
      const data = await buscarHistorias(texto);
      setResultados(data);
    } catch (error) {
      // silencioso
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    buscar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <div className="h-screen flex bg-slate-50">
      <Sidebar moduloActivo={0} onSeleccionar={() => navigate("/")} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-lg font-semibold text-slate-800">
                Buscar Historias Clinicas
              </h1>
              <button
                onClick={() => navigate("/")}
                className="text-sm bg-[#0f6e63] hover:bg-[#0b5850] text-white px-4 py-2 rounded-lg transition"
              >
                + Nueva Historia
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
              <input
                type="text"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Buscar por cedula o nombre del paciente..."
                className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f6e63]"
              />
              <button
                type="submit"
                className="bg-[#0f6e63] hover:bg-[#0b5850] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
              >
                Buscar
              </button>
            </form>

            {cargando && (
              <p className="text-sm text-slate-400 text-center py-8">
                Buscando...
              </p>
            )}

            {!cargando && resultados.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8 border border-dashed border-slate-300 rounded-lg">
                No se encontraron historias.
              </p>
            )}

            <div className="space-y-2">
              {resultados.map((historia) => (
                <div
                  key={historia.id}
                  className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {historia.paciente_nombre || "(Sin nombre)"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Cedula: {historia.paciente_cedula || "-"} &nbsp;|&nbsp;
                      Fecha: {formatearFecha(historia.fecha_atencion)}
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
                      className="text-xs bg-slate-100 hover:bg-slate-200 disabled:opacity-60 text-slate-700 px-3 py-1.5 rounded-lg transition"
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
'@ | Set-Content -Path "src\pages\BuscarHistorias.tsx" -Encoding UTF8

Write-Host "Actualizando src\pages\CrearMedico.tsx..." -ForegroundColor Green
@'
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { CampoTexto } from "../components/Campos";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";

interface Medico {
  id: number;
  nombre_completo: string;
  registro_medico: string;
  especialidad: string;
  usuario: string;
  activo: boolean;
}

export default function CrearMedico() {
  const { medico } = useAuth();
  const navigate = useNavigate();

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [registroMedico, setRegistroMedico] = useState("");
  const [especialidad, setEspecialidad] = useState("MEDICINA FISICA Y REHABILITACION");
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [medicos, setMedicos] = useState<Medico[]>([]);

  // Solo los administradores pueden ver esta pantalla. Si un medico
  // normal entra directo por la URL, lo mandamos de vuelta al inicio.
  useEffect(() => {
    if (medico && !medico.es_admin) {
      navigate("/");
    }
  }, [medico, navigate]);

  async function cargarMedicos() {
    try {
      const res = await api.get<Medico[]>("/auth/medicos");
      setMedicos(res.data);
    } catch {
      // silencioso (si no es admin, el backend igual rechaza esto con 403)
    }
  }

  useEffect(() => {
    if (medico?.es_admin) {
      cargarMedicos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medico]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);

    try {
      await api.post("/auth/medicos", {
        nombre_completo: nombreCompleto,
        registro_medico: registroMedico,
        especialidad,
        usuario,
        password,
      });
      setMensaje("Medico registrado correctamente");
      setNombreCompleto("");
      setRegistroMedico("");
      setUsuario("");
      setPassword("");
      cargarMedicos();
    } catch (error: any) {
      if (error.response?.status === 400) {
        setMensaje(`Error: ${error.response.data?.detail}`);
      } else if (error.response?.status === 403) {
        setMensaje("Error: No tienes permisos de administrador para esta accion.");
      } else if (!error.response) {
        setMensaje("Error: No se pudo conectar con el servidor.");
      } else {
        setMensaje("Error inesperado al registrar el medico.");
      }
    } finally {
      setGuardando(false);
    }
  }

  // Mientras se resuelve si es admin o no (o si no lo es y esta a punto
  // de ser redirigido), no mostramos el contenido para evitar parpadeo.
  if (!medico || !medico.es_admin) {
    return null;
  }

  return (
    <div className="h-screen flex bg-slate-50">
      <Sidebar moduloActivo={0} onSeleccionar={() => {}} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h1 className="text-lg font-semibold text-slate-800 mb-1">
                Registrar Medico Nuevo
              </h1>
              <p className="text-sm text-slate-500 mb-4">
                Crea el acceso para un colega que necesite usar el sistema de
                contingencia.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <CampoTexto
                  label="Nombre Completo"
                  value={nombreCompleto}
                  onChange={setNombreCompleto}
                />
                <div className="grid grid-cols-2 gap-3">
                  <CampoTexto
                    label="Registro Medico"
                    value={registroMedico}
                    onChange={setRegistroMedico}
                  />
                  <CampoTexto
                    label="Especialidad"
                    value={especialidad}
                    onChange={setEspecialidad}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <CampoTexto
                    label="Usuario (para iniciar sesion)"
                    value={usuario}
                    onChange={setUsuario}
                  />
                  <CampoTexto
                    label="Contraseña"
                    type="password"
                    value={password}
                    onChange={setPassword}
                  />
                </div>

                {mensaje && (
                  <p
                    className={`text-sm ${
                      mensaje.startsWith("Error") ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {mensaje}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={guardando}
                  className="bg-[#0f6e63] hover:bg-[#0b5850] disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
                >
                  {guardando ? "Registrando..." : "Registrar Medico"}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">
                Medicos registrados ({medicos.length})
              </h2>
              <div className="space-y-2">
                {medicos.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between text-sm border-b border-slate-100 pb-2"
                  >
                    <div>
                      <p className="font-medium text-slate-700">
                        {m.nombre_completo}
                      </p>
                      <p className="text-xs text-slate-400">
                        Usuario: {m.usuario} &nbsp;|&nbsp; Reg: {m.registro_medico}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        m.activo
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {m.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
'@ | Set-Content -Path "src\pages\CrearMedico.tsx" -Encoding UTF8

Write-Host "Actualizando index.html..." -ForegroundColor Green
@'
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <title>Sistema de Contingencia - Historias Clinicas</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
'@ | Set-Content -Path "index.html" -Encoding UTF8

Write-Host ""
Write-Host "Listo! Corre: npm run build" -ForegroundColor Yellow
