import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [montado, setMontado] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Un único momento de entrada orquestado: la tarjeta aparece con
  // una transición suave al cargar la pantalla, nada más se anima.
  useEffect(() => {
    const id = requestAnimationFrame(() => setMontado(true));
    return () => cancelAnimationFrame(id);
  }, []);

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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[#0d2540]">
      {/* Degradado sutil para dar profundidad al fondo, sin ser un cliché genérico */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(46,134,171,0.25), transparent 60%)",
        }}
      />

      {/* Línea de signos vitales como textura de marca, ya presente antes */}
      <svg
        className="absolute inset-x-0 bottom-0 w-full opacity-[0.10]"
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

      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative z-10 transition-all duration-700 ease-out ${
          montado ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="text-center mb-7">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-[#14375e] shadow-lg shadow-[#14375e]/30">
            <span className="text-white text-2xl font-bold">+</span>
          </div>
          <h1 className="text-xl font-semibold text-slate-800 tracking-tight font-['Manrope']">
            Sistema de Historia Clínica
          </h1>
          <p className="text-sm text-[#2e86ab] font-medium mt-1.5">
            Modo Contingencia · Sin Conexión
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Usuario
            </label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2e86ab] focus:border-transparent transition-shadow"
              placeholder="Ingrese su usuario"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2e86ab] focus:border-transparent transition-shadow"
              placeholder="Ingrese su contraseña"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-[#14375e] hover:bg-[#0f2c4c] active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 text-white font-semibold rounded-lg py-2.5 text-sm transition-all"
          >
            {cargando ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="flex items-center justify-center gap-2 mt-6 pt-5 border-t border-slate-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <p className="text-xs text-slate-400">
            El sistema funciona sin conexión. Los datos se guardan localmente.
          </p>
        </div>
      </div>
    </div>
  );
}