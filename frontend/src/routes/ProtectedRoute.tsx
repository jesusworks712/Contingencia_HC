import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { medico, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Cargando sesion...
      </div>
    );
  }

  if (!medico) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
