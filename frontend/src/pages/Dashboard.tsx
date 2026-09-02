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
  const [datos, setDatos] = useState<Record<string, any>>({
    fecha_atencion: new Date().toISOString().split("T")[0],
  });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [historiaFinalizada, setHistoriaFinalizada] = useState(false);

  // Transición sutil al cambiar de módulo: responde a la navegación del
  // usuario (anterior/siguiente/click en sidebar), no es decoración suelta.
  const [visible, setVisible] = useState(true);

  function irAModulo(nuevoModulo: number) {
    setVisible(false);
    setTimeout(() => {
      setModuloActivo(nuevoModulo);
      setVisible(true);
    }, 120);
  }

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
        irAModulo(moduloActivo + 1);
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
    setDatos({ fecha_atencion: new Date().toISOString().split("T")[0] });
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
        return (
          <Modulo8Incapacidad
            datos={datos}
            onChange={actualizarCampo}
          />
        );
      case 9:
        return <Modulo9Medicamentos datos={datos} onChange={actualizarCampo} />;
      default:
        return null;
    }
  }

  if (historiaFinalizada) {
    return (
      <div className="h-screen flex bg-[#f5f7fa]">
        <Sidebar moduloActivo={moduloActivo} onSeleccionar={() => {}} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 max-w-md text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-green-600 text-2xl">✓</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-800 mb-1 font-['Manrope']">
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
                className="bg-[#14375e] hover:bg-[#0f2c4c] active:scale-[0.98] text-white text-sm font-medium rounded-lg px-5 py-2.5 transition-all"
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
    <div className="h-screen flex bg-[#f5f7fa]">
      <Sidebar moduloActivo={moduloActivo} onSeleccionar={irAModulo} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div
            className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-4xl transition-opacity duration-150 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          >
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
                    onClick={() => irAModulo(moduloActivo - 1)}
                    className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Anterior
                  </button>
                )}

                {moduloActivo < TOTAL_MODULOS && (
                  <button
                    onClick={guardarYAvanzar}
                    disabled={guardando}
                    className="px-5 py-2 text-sm bg-[#14375e] hover:bg-[#0f2c4c] active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 text-white rounded-lg font-medium transition-all"
                  >
                    {guardando ? "Guardando..." : "Guardar y Siguiente"}
                  </button>
                )}

                {moduloActivo === TOTAL_MODULOS && (
                  <>
                    <button
                      onClick={guardarYAvanzar}
                      disabled={guardando}
                      className="px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-60 transition-colors"
                    >
                      Guardar borrador
                    </button>
                    <button
                      onClick={handleFinalizar}
                      disabled={guardando}
                      className="px-5 py-2 text-sm bg-green-600 hover:bg-green-700 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 text-white rounded-lg font-medium transition-all"
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