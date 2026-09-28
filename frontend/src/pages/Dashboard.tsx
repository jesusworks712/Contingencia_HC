﻿import { useState, useEffect, useRef } from "react";
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
  verificarDuplicado,
} from "../services/historias";

const TOTAL_MODULOS = 9;
const AUTOGUARDADO_MS = 15000;

export default function Dashboard() {
  const [moduloActivo, setModuloActivo] = useState(1);
  const [historiaId, setHistoriaId] = useState<number | null>(null);
  const [datos, setDatos] = useState<Record<string, any>>({
    fecha_atencion: new Date().toISOString().split("T")[0],
  });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [historiaFinalizada, setHistoriaFinalizada] = useState(false);

  const [visible, setVisible] = useState(true);

  // --- Autoguardado ---
  const [ultimoAutoguardado, setUltimoAutoguardado] = useState<Date | null>(null);
  const datosRef = useRef(datos);
  const historiaIdRef = useRef(historiaId);
  const guardandoRef = useRef(guardando);
  const cambiosSinGuardar = useRef(false);
  datosRef.current = datos;
  historiaIdRef.current = historiaId;
  guardandoRef.current = guardando;

  // --- Aviso de posible duplicado (misma cédula + fecha) ---
  const [avisoDuplicado, setAvisoDuplicado] = useState<string | null>(null);

  // --- Estado de conexión ---
  const [sinConexion, setSinConexion] = useState(!navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      setSinConexion(false);
    }
    function handleOffline() {
      setSinConexion(true);
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  function irAModulo(nuevoModulo: number) {
    setVisible(false);
    setTimeout(() => {
      setModuloActivo(nuevoModulo);
      setVisible(true);
    }, 120);
  }

  function actualizarCampo(campo: string, valor: any) {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
    cambiosSinGuardar.current = true;
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
      cambiosSinGuardar.current = false;
      setMensaje("Guardado correctamente");
      if (moduloActivo < TOTAL_MODULOS) {
        irAModulo(moduloActivo + 1);
      }
      setTimeout(() => setMensaje(null), 3000);
    }

    setGuardando(false);
  }

  // Autoguardado silencioso: cada AUTOGUARDADO_MS, si hay cambios sin
  // guardar y no se está guardando ya, guarda sin avanzar ni mostrar
  // mensajes de error intrusivos.
  useEffect(() => {
    const intervalo = setInterval(async () => {
      if (historiaFinalizada) return;
      if (guardandoRef.current) return;
      if (!cambiosSinGuardar.current) return;

      const tieneAlgoQueGuardar =
        datosRef.current.paciente_nombre || datosRef.current.paciente_cedula || historiaIdRef.current;
      if (!tieneAlgoQueGuardar) return;

      try {
        if (!historiaIdRef.current) {
          const nueva = await crearHistoria({ ...datosRef.current, modulo_actual: moduloActivo });
          setHistoriaId(nueva.id);
        } else {
          await actualizarHistoria(historiaIdRef.current, { ...datosRef.current, modulo_actual: moduloActivo });
        }
        cambiosSinGuardar.current = false;
        setUltimoAutoguardado(new Date());
      } catch {
        // Autoguardado silencioso: si falla (ej. sin conexión), simplemente
        // se reintenta en el próximo ciclo. No se pierden los datos en pantalla.
      }
    }, AUTOGUARDADO_MS);

    return () => clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historiaFinalizada, moduloActivo]);

  // Aviso de posible duplicado: cuando hay cédula + fecha, consulta si ya
  // existe otra historia con esos mismos datos.
  useEffect(() => {
    const cedula = datos.paciente_cedula;
    const fecha = datos.fecha_atencion;
    if (!cedula || !fecha || historiaFinalizada) {
      setAvisoDuplicado(null);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const resultado = await verificarDuplicado(cedula, fecha, historiaId || undefined);
        if (resultado.duplicado) {
          setAvisoDuplicado(
            `Ya existe ${resultado.historias.length > 1 ? "más de una historia" : "una historia"} con esta cédula y fecha. Verifica que no sea un registro duplicado.`
          );
        } else {
          setAvisoDuplicado(null);
        }
      } catch {
        // silencioso: si falla la verificación, simplemente no se muestra aviso
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [datos.paciente_cedula, datos.fecha_atencion, historiaId, historiaFinalizada]);

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
        cambiosSinGuardar.current = false;
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
    setUltimoAutoguardado(null);
    setAvisoDuplicado(null);
    cambiosSinGuardar.current = false;
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

        {sinConexion && (
          <div className="bg-red-600 text-white text-xs text-center py-1.5 font-medium">
            Sin conexión con el servidor. Tus datos siguen en pantalla; se guardarán al reconectar.
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-6">
          <div
            className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-4xl transition-opacity duration-150 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          >
            {avisoDuplicado && (
              <div className="mb-4 bg-amber-50 border border-amber-300 text-amber-800 text-sm rounded-lg px-4 py-2.5">
                ⚠ {avisoDuplicado}
              </div>
            )}

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
                    {ultimoAutoguardado && (
                      <> · Autoguardado {ultimoAutoguardado.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</>
                    )}
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