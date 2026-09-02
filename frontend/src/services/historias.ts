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

export async function abrirPdfIncapacidad(id: number) {
  const res = await api.get(`/historias/${id}/incapacidad-pdf`, {
    responseType: "blob",
  });
  const blobUrl = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
  window.open(blobUrl, "_blank");
  setTimeout(() => window.URL.revokeObjectURL(blobUrl), 30000);
}