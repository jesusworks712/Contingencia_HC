import { PDFDocument } from "pdf-lib";

const RUTA_PDF = "/formula-medica-manual.pdf";
const CAMPO_DESCRIPCION = "Descripción";

/**
 * Abre la formula manual en una pestaña nueva con el campo "Descripción"
 * ya diligenciado con el texto indicado. No modifica el PDF original en /public.
 */
export async function abrirFormulaManualCon(textoDescripcion: string) {
  const bytesOriginal = await fetch(RUTA_PDF).then((r) => r.arrayBuffer());
  const pdfDoc = await PDFDocument.load(bytesOriginal);
  const form = pdfDoc.getForm();

  const campo = form.getTextField(CAMPO_DESCRIPCION);
  // El campo no trae /DA (default appearance); se crea uno para poder fijar el tamaño de letra
  campo.acroField.setDefaultAppearance("/Helv 0 Tf 0 g");
  campo.setFontSize(11);
  campo.setText(textoDescripcion);
  form.updateFieldAppearances();

  const bytesFinal = await pdfDoc.save();
  const blob = new Blob([bytesFinal.buffer as ArrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

/** Formula manual para el modulo de Incapacidad, con el texto fijo ya cargado. */
export function abrirFormulaManualIncapacidad() {
  return abrirFormulaManualCon("REMISION DE INCAPACIDAD MEDICA");
}