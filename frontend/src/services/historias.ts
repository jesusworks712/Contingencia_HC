import { api } from "../api/axios";

export interface HistoriaClinica {
  id: number;
  medico_id: number;
  medico_nombre?: string;
  estado: string;
  fecha_atencion: string;
  [key: string]: any;
}

export async function crearHistoria(datosIniciales: Record<string, any> = {}) {
  const res = await api.post<HistoriaClinica>("/historias", datosIniciales);
  return res.data;
}

export async function actualizarHistoria(id: number, datos: Record<string, any>) {
  const res = await api.put<HistoriaClinica>(`/historias/${id}`, datos);
  return res.data;
}

export async function obtenerHistoria(id: number) {
  const res = await api.get<HistoriaClinica>(`/historias/${id}`);
  return res.data;
}

export async function finalizarHistoria(id: number) {
  const res = await api.put<HistoriaClinica>(`/historias/${id}/finalizar`);
  return res.data;
}

export async function buscarHistorias(texto?: string, estado?: string, medicoId?: number) {
  const res = await api.get<HistoriaClinica[]>("/historias", {
    params: {
      buscar: texto || undefined,
      estado: estado || undefined,
      medico_id: medicoId || undefined,
    },
  });
  return res.data;
}

export async function abrirPdfHistoria(id: number) {
  const res = await api.get(`/historias/${id}/pdf`, {
    responseType: "blob",
  });
  const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
  window.open(blobUrl, "_blank");
  setTimeout(() => window.URL.revokeObjectURL(blobUrl), 30000);
}

export async function marcarTranscrita(id: number, transcrita: boolean) {
  const res = await api.put<HistoriaClinica>(`/historias/${id}/transcrita`, null, {
    params: { transcrita },
  });
  return res.data;
}

export async function obtenerAuditoria(id: number) {
  const res = await api.get(`/historias/${id}/auditoria`);
  return res.data as {
    id: number;
    accion: string;
    detalle?: string;
    fecha: string;
    medico_nombre?: string;
  }[];
}

export async function exportarPendientesZip(medicoId?: number) {
  const res = await api.get("/historias/exportar-pendientes/zip", {
    responseType: "blob",
    params: { medico_id: medicoId || undefined },
  });
  const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: "application/zip" }));
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = `pendientes_pana_${new Date().toISOString().split("T")[0]}.zip`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => window.URL.revokeObjectURL(blobUrl), 30000);
}

export async function verificarDuplicado(cedula: string, fecha: string, historiaIdActual?: number) {
  const res = await api.get("/historias/verificar-duplicado/existe", {
    params: { cedula, fecha, historia_id_actual: historiaIdActual },
  });
  return res.data as { duplicado: boolean; historias: { id: number; estado: string }[] };
}