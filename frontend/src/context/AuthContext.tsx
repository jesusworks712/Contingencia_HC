import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { api } from "../api/axios";

interface Medico {
  id: number;
  nombre_completo: string;
  registro_medico: string;
  especialidad: string;
  usuario: string;
  activo: boolean;
  es_admin: boolean;
}

interface AuthContextType {
  medico: Medico | null;
  loading: boolean;
  login: (usuario: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [medico, setMedico] = useState<Medico | null>(null);
  const [loading, setLoading] = useState(true);

  // Al cargar la app, si ya hay un token guardado, intentamos
  // recuperar la sesion pidiendo el perfil del medico.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get<Medico>("/auth/yo")
      .then((res) => setMedico(res.data))
      .catch(() => {
        localStorage.removeItem("token");
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(usuario: string, password: string) {
    // El backend espera form-data (OAuth2PasswordRequestForm), no JSON.
    const form = new URLSearchParams();
    form.append("username", usuario);
    form.append("password", password);

    const res = await api.post("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    localStorage.setItem("token", res.data.access_token);

    const perfil = await api.get<Medico>("/auth/yo");
    setMedico(perfil.data);
  }

  function logout() {
    localStorage.removeItem("token");
    setMedico(null);
  }

  return (
    <AuthContext.Provider value={{ medico, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
