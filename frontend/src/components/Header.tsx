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
        <h1 className="text-sm font-semibold text-slate-800 font-['Manrope']">
          Historia Clínica - Consulta Externa
        </h1>
        <nav className="flex items-center gap-1">
          <button
            onClick={() => navigate("/")}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${
              location.pathname === "/"
                ? "bg-[#eaf1f8] text-[#14375e]"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Nueva Historia
          </button>
          <button
            onClick={() => navigate("/buscar")}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${
              location.pathname === "/buscar"
                ? "bg-[#eaf1f8] text-[#14375e]"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Buscar Historias
          </button>
          {medico?.es_admin && (
            <button
              onClick={() => navigate("/medicos")}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${
                location.pathname === "/medicos"
                  ? "bg-[#eaf1f8] text-[#14375e]"
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
              <span className="ml-2 text-[10px] bg-[#eaf1f8] text-[#14375e] px-1.5 py-0.5 rounded-full align-middle font-semibold">
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
          className="text-xs text-slate-500 hover:text-red-600 border border-slate-300 hover:border-red-300 rounded-lg px-3 py-1.5 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}