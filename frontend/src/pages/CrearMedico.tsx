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
  const [cambiandoEstadoId, setCambiandoEstadoId] = useState<number | null>(null);

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

  async function cambiarEstado(m: Medico) {
    setCambiandoEstadoId(m.id);
    try {
      await api.patch(`/auth/medicos/${m.id}/estado`, { activo: !m.activo });
      await cargarMedicos();
    } catch (error: any) {
      const detalle = error.response?.data?.detail || "No se pudo actualizar el estado del medico.";
      alert(detalle);
    } finally {
      setCambiandoEstadoId(null);
    }
  }

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
    <div className="h-screen flex bg-[#f5f7fa]">
      <Sidebar moduloActivo={0} onSeleccionar={() => {}} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h1 className="text-lg font-semibold text-slate-800 mb-1 font-['Manrope']">
                Registrar Médico Nuevo
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
                  className="bg-[#14375e] hover:bg-[#0f2c4c] active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all"
                >
                  {guardando ? "Registrando..." : "Registrar Médico"}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-slate-700 mb-3 font-['Manrope']">
                Médicos registrados ({medicos.length})
              </h2>
              <div className="space-y-2">
                {medicos.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between text-sm border-b border-slate-100 pb-2.5 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-slate-700">
                        {m.nombre_completo}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Usuario: {m.usuario} &nbsp;·&nbsp; Reg: {m.registro_medico}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => cambiarEstado(m)}
                      disabled={cambiandoEstadoId === m.id || m.id === medico?.id}
                      title={
                        m.id === medico?.id
                          ? "No puedes cambiar tu propio estado"
                          : m.activo
                          ? "Clic para inactivar"
                          : "Clic para activar"
                      }
                      className={`text-xs px-2.5 py-1 rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                        m.activo
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {cambiandoEstadoId === m.id
                        ? "Actualizando..."
                        : m.activo
                        ? "Activo"
                        : "Inactivo"}
                    </button>
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