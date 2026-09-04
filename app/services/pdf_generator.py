"""
Generador de PDF para historias clinicas, usando ReportLab.
"""
import io
from pathlib import Path
from typing import Optional

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    Image,
)

from app.models.historia_clinica import HistoriaClinica

COLOR_PRIMARIO = colors.HexColor("#0f6e63")
COLOR_PRIMARIO_OSCURO = colors.HexColor("#0b5850")
COLOR_TEXTO_SUAVE = colors.HexColor("#555555")
COLOR_LINEA = colors.HexColor("#dddddd")
COLOR_FONDO_SECCION = colors.HexColor("#e6f3f1")

LOGO_PATH = Path(__file__).resolve().parent.parent / "static" / "logo.png"

styles = getSampleStyleSheet()

titulo_style = ParagraphStyle("TituloHistoria", parent=styles["Heading1"], fontSize=15, fontName="Helvetica-Bold", spaceAfter=2, textColor=COLOR_PRIMARIO_OSCURO)
subtitulo_marca_style = ParagraphStyle("SubtituloMarca", parent=styles["Normal"], fontSize=9, textColor=COLOR_TEXTO_SUAVE)
subtitulo_style = ParagraphStyle("Subtitulo", parent=styles["Normal"], fontSize=8.5, textColor=COLOR_TEXTO_SUAVE)
seccion_style = ParagraphStyle("Seccion", parent=styles["Heading2"], fontSize=10.5, fontName="Helvetica-Bold", spaceBefore=14, spaceAfter=6, textColor=colors.white, backColor=COLOR_PRIMARIO, leftIndent=6, borderPadding=(5, 5, 5, 5))
texto_style = ParagraphStyle("TextoNormal", parent=styles["Normal"], fontSize=9.5, leading=13)
etiqueta_style = ParagraphStyle("Etiqueta", parent=styles["Normal"], fontSize=8.5, fontName="Helvetica-Bold", textColor=COLOR_TEXTO_SUAVE)


def _valor(v) -> str:
    if v is None or v == "":
        return "-"
    return str(v)


def _fila(etiqueta: str, valor) -> list:
    return [Paragraph(etiqueta, etiqueta_style), Paragraph(_valor(valor), texto_style)]


def _tabla_datos(filas: list, col_widths=(4.5 * cm, 12.5 * cm)) -> Table:
    tabla = Table(filas, colWidths=list(col_widths))
    tabla.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("LINEBELOW", (0, 0), (-1, -1), 0.3, COLOR_LINEA),
    ]))
    return tabla


def _seccion(titulo: str) -> Paragraph:
    return Paragraph(titulo, seccion_style)


def _dict_a_texto(d: Optional[dict]) -> str:
    if not d:
        return "-"
    partes = []
    for clave, valor in d.items():
        if valor not in (None, ""):
            etiqueta = clave.replace("_", " ").capitalize()
            partes.append(f"<b>{etiqueta}:</b> {valor}")
    return "<br/>".join(partes) if partes else "-"


def _lista_medicamentos(medicamentos) -> Table:
    encabezados = ["Medicamento", "Presentacion", "Dosis", "Cada (h)", "Cant.", "Dias", "Indicaciones"]
    filas = [encabezados]
    if medicamentos:
        for m in medicamentos:
            filas.append([_valor(m.get("nombre")), _valor(m.get("presentacion")), _valor(m.get("dosis")), _valor(m.get("horas")), _valor(m.get("cantidad")), _valor(m.get("dias")), _valor(m.get("indicaciones"))])
    else:
        filas.append(["-", "-", "-", "-", "-", "-", "-"])

    tabla = Table(filas, colWidths=[3.2 * cm, 2.5 * cm, 1.8 * cm, 1.6 * cm, 1.4 * cm, 1.4 * cm, 5.1 * cm])
    tabla.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), COLOR_FONDO_SECCION),
        ("TEXTCOLOR", (0, 0), (-1, 0), COLOR_PRIMARIO_OSCURO),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.3, COLOR_LINEA),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    return tabla


def _lista_apoyo_diagnostico(items) -> Table:
    encabezados = ["Codigo", "Cantidad", "Nombre", "Observacion"]
    filas = [encabezados]
    if items:
        for it in items:
            filas.append([_valor(it.get("codigo")), _valor(it.get("cantidad")), _valor(it.get("nombre")), _valor(it.get("observacion"))])
    else:
        filas.append(["-", "-", "-", "-"])

    tabla = Table(filas, colWidths=[2.5 * cm, 2 * cm, 5 * cm, 7.5 * cm])
    tabla.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), COLOR_FONDO_SECCION),
        ("TEXTCOLOR", (0, 0), (-1, 0), COLOR_PRIMARIO_OSCURO),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.3, COLOR_LINEA),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    return tabla


def _encabezado_marca(historia: HistoriaClinica, nombre_medico: str) -> Table:
    if LOGO_PATH.exists():
        logo = Image(str(LOGO_PATH), width=1.8 * cm, height=1.8 * cm)
    else:
        logo = Paragraph("", texto_style)

    info = [
        Paragraph("IPS REHABILITAR", titulo_style),
        Paragraph("Historia Clinica - Consulta Externa", subtitulo_marca_style),
        Spacer(1, 4),
        Paragraph(
            f"Historia N.\u00b0 {historia.id} &nbsp;|&nbsp; Estado: <b>{historia.estado.upper()}</b> "
            f"&nbsp;|&nbsp; Fecha de atencion: {historia.fecha_atencion.strftime('%d/%m/%Y %H:%M')}"
            f"&nbsp;|&nbsp; Medico: {nombre_medico}",
            subtitulo_style,
        ),
    ]

    tabla = Table([[logo, info]], colWidths=[2.3 * cm, 14.7 * cm])
    tabla.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (0, 0), 0),
    ]))
    return tabla


def generar_pdf_historia(historia: HistoriaClinica, nombre_medico: str) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=1.5 * cm, bottomMargin=1.5 * cm, leftMargin=1.5 * cm, rightMargin=1.5 * cm)

    elementos = []
    elementos.append(_encabezado_marca(historia, nombre_medico))
    elementos.append(Spacer(1, 8))
    elementos.append(HRFlowable(width="100%", color=COLOR_PRIMARIO, thickness=1.4))
    elementos.append(Spacer(1, 4))

    elementos.append(_seccion("1. IDENTIFICACION DEL PACIENTE"))
    elementos.append(_tabla_datos([
        _fila("Nombre", historia.paciente_nombre),
        _fila("Cedula", historia.paciente_cedula),
        _fila("Sexo", historia.paciente_sexo),
        _fila("Fecha de nacimiento", historia.paciente_fecha_nacimiento.strftime("%d/%m/%Y") if historia.paciente_fecha_nacimiento else None),
        _fila("Ocupacion", historia.paciente_ocupacion),
        _fila("Direccion", historia.paciente_direccion),
        _fila("Telefono", historia.paciente_telefono),
        _fila("Ciudad de residencia", historia.paciente_ciudad_residencia),
        _fila("Regimen", historia.paciente_regimen),
        _fila("Convenio", historia.paciente_convenio),
        _fila("Asegurador", historia.paciente_asegurador),
        _fila("Estado civil", historia.paciente_estado_civil),
        _fila("Discapacidad", historia.paciente_discapacidad),
        _fila("Etnia", historia.paciente_etnia),
        _fila("Religion", historia.paciente_religion),
        _fila("Acompa\u00f1ante", f"{_valor(historia.acompanante)} ({_valor(historia.parentesco_acompanante)}) Tel: {_valor(historia.telefono_acompanante)}"),
        _fila("Responsable", f"{_valor(historia.responsable)} ({_valor(historia.parentesco_responsable)}) Tel: {_valor(historia.telefono_responsable)}"),
    ]))

    elementos.append(_seccion("2. DATOS DE ATENCION"))
    elementos.append(_tabla_datos([
        _fila("Motivo de consulta", historia.motivo_consulta),
        _fila("Enfermedad actual", historia.enfermedad_actual),
    ]))

    elementos.append(_seccion("3. ANTECEDENTES"))
    elementos.append(_tabla_datos([
        _fila("Alergias", historia.alergias),
        _fila("Traumatologicos", historia.antecedentes_traumatologicos),
        _fila("Quirurgicos", historia.antecedentes_quirurgicos),
    ]))

    elementos.append(_seccion("4. SIGNOS VITALES"))
    elementos.append(Paragraph(_dict_a_texto(historia.signos_vitales), texto_style))
    elementos.append(Spacer(1, 6))

    elementos.append(_seccion("5. EXAMEN POR SISTEMAS"))
    elementos.append(Paragraph(_dict_a_texto(historia.examen_sistema_fisico), texto_style))
    elementos.append(Spacer(1, 6))

    elementos.append(_seccion("6. EXAMEN FISICO SEGMENTARIO"))
    elementos.append(Paragraph(_dict_a_texto(historia.examen_fisico), texto_style))

    elementos.append(_seccion("7. VALORACION MEDICA Y DIAGNOSTICOS"))
    elementos.append(_tabla_datos([
        _fila("Valoracion medica", historia.valoracion_medica),
        _fila("Diagnostico principal", historia.diagnostico_principal),
        _fila("Diagnostico relacionado 1", historia.diagnostico_relacionado_1),
        _fila("Diagnostico relacionado 2", historia.diagnostico_relacionado_2),
        _fila("Diagnostico relacionado 3", historia.diagnostico_relacionado_3),
        _fila("Causa externa", historia.causa_externa),
        _fila("Tipo de diagnostico", historia.tipo_diagnostico),
        _fila("Finalidad", historia.finalidad),
    ]))

    elementos.append(_seccion("8. INCAPACIDAD Y APOYO DIAGNOSTICO"))
    elementos.append(_tabla_datos([
        _fila("Incapacidad", historia.incapacidad),
        _fila("Solicitudes de apoyo diagnostico", historia.solicitudes_apoyo_diagnostico),
    ]))
    elementos.append(Spacer(1, 4))
    elementos.append(_lista_apoyo_diagnostico(historia.apoyo_diagnostico))

    elementos.append(_seccion("9. MEDICAMENTOS Y RECOMENDACIONES"))
    elementos.append(_lista_medicamentos(historia.medicamentos))
    elementos.append(Spacer(1, 6))
    elementos.append(_tabla_datos([
        _fila("Solicitudes de medicamentos", historia.solicitudes_medicamentos),
        _fila("Recomendaciones", historia.recomendaciones),
    ]))

    doc.build(elementos)
    return buffer.getvalue()