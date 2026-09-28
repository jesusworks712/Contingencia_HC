"""
Generador de PDF para historias clínicas, usando ReportLab.
"""
import io
import logging
from pathlib import Path
from typing import Optional

from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas as pdfcanvas
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    Image,
    PageBreak,
)

from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from app.models.historia_clinica import HistoriaClinica
from app.core.constantes import TIPOS_IDENTIFICACION

# ── Registro de fuente con soporte de tildes y ñ ─────────────────────────────
# Busca Liberation Sans en Linux, Windows y macOS.
# Si no se encuentra en ninguna ruta conocida, cae a Helvetica (sin tildes)
# pero el servidor sigue arrancando.
def _registrar_fuentes() -> str:
    """Registra Liberation Sans y devuelve el nombre de la fuente normal."""
    import sys as _sys
    from pathlib import Path as _Path

    _candidatos = []

    if _sys.platform.startswith("win"):
        # Windows: Liberation Sans viene con LibreOffice o se puede instalar;
        # también probamos con Arial que sí soporta caracteres latinos.
        _winfonts = _Path("C:/Windows/Fonts")
        _candidatos += [
            (_winfonts / "LiberationSans-Regular.ttf", _winfonts / "LiberationSans-Bold.ttf"),
            (_winfonts / "arial.ttf",                  _winfonts / "arialbd.ttf"),
            (_winfonts / "Arial.ttf",                  _winfonts / "ArialBD.ttf"),
        ]
        # LibreOffice en Windows
        for _lo in ["C:/Program Files/LibreOffice", "C:/Program Files (x86)/LibreOffice"]:
            _lop = _Path(_lo) / "share/fonts/truetype"
            _candidatos.append((
                _lop / "LiberationSans-Regular.ttf",
                _lop / "LiberationSans-Bold.ttf",
            ))
    elif _sys.platform == "darwin":
        _candidatos += [
            (_Path("/Library/Fonts/LiberationSans-Regular.ttf"),
             _Path("/Library/Fonts/LiberationSans-Bold.ttf")),
            (_Path("/System/Library/Fonts/Helvetica.ttc"),
             _Path("/System/Library/Fonts/Helvetica.ttc")),
        ]
    else:
        # Linux
        _candidatos += [
            (_Path("/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"),
             _Path("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf")),
            (_Path("/usr/share/fonts/liberation/LiberationSans-Regular.ttf"),
             _Path("/usr/share/fonts/liberation/LiberationSans-Bold.ttf")),
        ]

    from reportlab.pdfbase.pdfmetrics import registerFontFamily as _rff
    for _reg, _bold in _candidatos:
        if _reg.exists() and _bold.exists():
            try:
                pdfmetrics.registerFont(TTFont("LibSans",      str(_reg)))
                pdfmetrics.registerFont(TTFont("LibSans-Bold", str(_bold)))
                _rff("LibSans", normal="LibSans", bold="LibSans-Bold")
                return "LibSans"
            except Exception:
                continue

    # Fallback: Helvetica (sin tildes, pero el servidor no cae)
    logging.getLogger(__name__).warning(
        "No se encontró Liberation Sans ni Arial. El PDF usará Helvetica (sin soporte de tildes). "
        "Instale LibreOffice o copie LiberationSans-Regular.ttf y LiberationSans-Bold.ttf "
        "a C:/Windows/Fonts en el servidor."
    )
    return "Helvetica"


_FUENTE_NORMAL = _registrar_fuentes()
_FUENTE_BOLD   = "LibSans-Bold" if _FUENTE_NORMAL == "LibSans" else "Helvetica-Bold"

logger = logging.getLogger(__name__)

# Paleta institucional (azul Rehabilitar), igual a la usada en el frontend.
COLOR_PRIMARIO = colors.HexColor("#14375e")
COLOR_PRIMARIO_OSCURO = colors.HexColor("#0d2540")
COLOR_TEXTO_SUAVE = colors.HexColor("#555555")
COLOR_LINEA = colors.HexColor("#dddddd")
COLOR_FONDO_SECCION = colors.HexColor("#dce8f4")
COLOR_MARCA_AGUA = colors.HexColor("#f0f0f0")

WATERMARK_TEXTO = "CONTINGENCIA"

LOGO_PATH = Path(__file__).resolve().parent.parent / "static" / "Logo-Rehabilitar.png"

# Logo Rehabilitar: imagen cuadrada 1080x1080 px.
LOGO_ANCHO_PX = 1080
LOGO_ALTO_PX = 1080

styles = getSampleStyleSheet()

titulo_style = ParagraphStyle("TituloHistoria", parent=styles["Heading1"], fontSize=13, fontName=_FUENTE_BOLD, spaceAfter=2, textColor=COLOR_PRIMARIO_OSCURO)
subtitulo_marca_style = ParagraphStyle("SubtituloMarca", parent=styles["Normal"], fontSize=9, textColor=COLOR_TEXTO_SUAVE, fontName=_FUENTE_NORMAL)
subtitulo_style = ParagraphStyle("Subtitulo", parent=styles["Normal"], fontSize=8.5, textColor=COLOR_TEXTO_SUAVE, fontName=_FUENTE_NORMAL)
seccion_style = ParagraphStyle("Seccion", parent=styles["Heading2"], fontSize=10.5, fontName=_FUENTE_BOLD, spaceBefore=14, spaceAfter=6, textColor=colors.white, backColor=COLOR_PRIMARIO, leftIndent=6, borderPadding=(5, 5, 5, 5))
texto_style = ParagraphStyle("TextoNormal", parent=styles["Normal"], fontSize=9.5, leading=13, fontName=_FUENTE_NORMAL)
texto_justificado_style = ParagraphStyle("TextoJustificado", parent=styles["Normal"], fontSize=9.5, leading=13, fontName=_FUENTE_NORMAL, alignment=TA_JUSTIFY)
etiqueta_style = ParagraphStyle("Etiqueta", parent=styles["Normal"], fontSize=8.5, fontName=_FUENTE_BOLD, textColor=COLOR_TEXTO_SUAVE)


class _CanvasConNumeracion(pdfcanvas.Canvas):
    """Canvas que agrega 'Página X de Y' y una marca de agua a cada página."""

    def __init__(self, *args, **kwargs):
        pdfcanvas.Canvas.__init__(self, *args, **kwargs)
        self._paginas_guardadas = []

    def showPage(self):
        self._paginas_guardadas.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        total_paginas = len(self._paginas_guardadas)
        for estado in self._paginas_guardadas:
            self.__dict__.update(estado)
            self._dibujar_marca_agua()
            self._dibujar_numeracion(total_paginas)
            pdfcanvas.Canvas.showPage(self)
        pdfcanvas.Canvas.save(self)

    def _dibujar_marca_agua(self) -> None:
        """Dibuja la marca de agua semitransparente al fondo."""
        self.saveState()
        self.setFont("Helvetica-Bold", 52)
        self.setFillColor(colors.HexColor("#14375e"))
        self.setFillAlpha(0.06)
        self.translate(letter[0] / 2, letter[1] / 2)
        self.rotate(45)
        self.drawCentredString(0, 0, WATERMARK_TEXTO)
        self.restoreState()

    def _dibujar_numeracion(self, total_paginas: int) -> None:
        """Dibuja el número de página encima del contenido."""
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(COLOR_TEXTO_SUAVE)
        self.drawRightString(
            letter[0] - 1.5 * cm, 1 * cm,
            f"Página {self.getPageNumber()} de {total_paginas}",
        )
        self.restoreState()


def _valor(v) -> str:
    if v is None or v == "":
        return "-"
    return str(v)


def _valor_dx(v) -> str:
    """Quita el punto del código CIE-10: M54.4 → M544."""
    import re
    texto = _valor(v)
    if texto == "-":
        return texto
    return re.sub(r"^([A-Z]\d{2})\.([\dX])", r"\1\2", texto)


def _tipo_identificacion(sigla) -> str:
    if not sigla:
        return "-"
    nombre = TIPOS_IDENTIFICACION.get(sigla)
    return f"{sigla} - {nombre}" if nombre else str(sigla)


def _fila(etiqueta: str, valor) -> list:
    return [Paragraph(etiqueta, etiqueta_style), Paragraph(_valor(valor), texto_style)]


def _fila_justificada(etiqueta: str, valor) -> list:
    """Como _fila pero el texto del valor va justificado (valoración, recomendaciones)."""
    return [Paragraph(etiqueta, etiqueta_style), Paragraph(_valor(valor), texto_justificado_style)]


def _fila_dx(etiqueta: str, valor) -> list:
    """Como _fila pero quita el punto del código CIE-10 (M54.4 → M544)."""
    return [Paragraph(etiqueta, etiqueta_style), Paragraph(_valor_dx(valor), texto_style)]


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
    _etiquetas = {
        "peso": "Peso (kg)", "talla": "Talla (cm)", "temperatura": "Temperatura (°C)",
        "diametro_muneca": "Diámetro muñeca (cm)", "tension_arterial": "Tensión arterial",
        "clasificacion_imc": "Clasificación IMC", "perimetro_cefalico": "Per. cefálico (cm)",
        "pliegue_tricipital": "Pliegue tricipital", "frecuencia_cardiaca": "Frec. cardíaca (lpm)",
        "perimetro_branquial": "Per. branquial (cm)", "indice_masa_muscular": "Índice masa muscular",
        "pliegue_subescapular": "Pliegue subescapular", "frecuencia_respiratoria": "Frec. respiratoria (rpm)",
        "circunferencia_abdominal": "Circunferencia abdominal (cm)",
        "saturacion_oxigeno": "Sat. O₂ (%)", "glucometria": "Glucometría (mg/dL)",
    }
    partes = []
    for clave, valor in d.items():
        if valor not in (None, ""):
            etiqueta = _etiquetas.get(clave, clave.replace("_", " ").capitalize())
            partes.append(f"<b>{etiqueta}:</b> {valor}")
    return "  ".join(partes)


def _lista_medicamentos(medicamentos) -> Table:
    encabezados = ["Medicamento", "Presentación", "Dosis", "Cada (h)", "Cant.", "Días", "Indicaciones"]
    filas = [encabezados]
    _p = lambda t: Paragraph(t, texto_style)
    if medicamentos:
        for m in medicamentos:
            filas.append([_p(_valor(m.get("nombre"))), _p(_valor(m.get("presentacion"))),
                          _p(_valor(m.get("dosis"))), _p(_valor(m.get("horas"))),
                          _p(_valor(m.get("cantidad"))), _p(_valor(m.get("dias"))),
                          _p(_valor(m.get("indicaciones")))])
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
    encabezados = ["Código", "Cantidad", "Nombre", "Observación"]
    filas = [encabezados]
    _p = lambda t: Paragraph(t, texto_style)
    if items:
        for it in items:
            filas.append([_p(_valor(it.get("codigo"))), _p(_valor(it.get("cantidad"))),
                          _p(_valor(it.get("nombre"))), _p(_valor(it.get("observacion")))])
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
        # Ancho fijo; el alto se calcula a partir de la relación de aspecto
        # real del archivo para que el logo no se vea aplastado.
        ancho_logo = 3.5 * cm
        alto_logo = ancho_logo * (LOGO_ALTO_PX / LOGO_ANCHO_PX)
        logo = Image(str(LOGO_PATH), width=ancho_logo, height=alto_logo)
    else:
        logger.warning("logo.png no encontrado en %s; el PDF se generará sin logo.", LOGO_PATH)
        logo = Paragraph("", texto_style)

    fecha_atencion = historia.fecha_atencion.strftime("%d/%m/%Y %H:%M") if historia.fecha_atencion else "-"

    info = [
        Paragraph("Historia Clínica - Consulta Externa", titulo_style),
        Spacer(1, 4),
        Paragraph(
            f"Historia N.\u00b0 {historia.id} &nbsp;|&nbsp; Estado: <b>{historia.estado.upper()}</b> "
            f"&nbsp;|&nbsp; Fecha de atención: {fecha_atencion}"
            f"&nbsp;|&nbsp; Médico: {nombre_medico}",
            subtitulo_style,
        ),
    ]

    tabla = Table([[logo, info]], colWidths=[4.2 * cm, 12.8 * cm])
    tabla.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (0, 0), 0),
    ]))
    return tabla


def generar_pdf_historia(historia: HistoriaClinica, nombre_medico: str) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=1.5 * cm, bottomMargin=1.8 * cm, leftMargin=1.5 * cm, rightMargin=1.5 * cm)

    elementos = []
    elementos.append(_encabezado_marca(historia, nombre_medico))
    elementos.append(Spacer(1, 8))
    elementos.append(HRFlowable(width="100%", color=COLOR_PRIMARIO, thickness=1.4))
    elementos.append(Spacer(1, 4))

    elementos.append(_seccion("1. IDENTIFICACIÓN DEL PACIENTE"))
    elementos.append(_tabla_datos([
        _fila("Nombre", historia.paciente_nombre),
        _fila("Tipo de identificación", _tipo_identificacion(historia.paciente_tipo_identificacion)),
        _fila("Número de identificación", historia.paciente_cedula),
        _fila("Sexo", historia.paciente_sexo),
        _fila("Fecha de nacimiento", historia.paciente_fecha_nacimiento.strftime("%d/%m/%Y") if historia.paciente_fecha_nacimiento else None),
        _fila("Ocupación", historia.paciente_ocupacion),
        _fila("Dirección", historia.paciente_direccion),
        _fila("Teléfono", historia.paciente_telefono),
        _fila("Ciudad de residencia", historia.paciente_ciudad_residencia),
        _fila("Régimen", historia.paciente_regimen),
        _fila("Convenio", historia.paciente_convenio),
        _fila("Asegurador", historia.paciente_asegurador),
        _fila("Estado civil", historia.paciente_estado_civil),
        _fila("Discapacidad", historia.paciente_discapacidad),
        _fila("Etnia", historia.paciente_etnia),
        _fila("Religión", historia.paciente_religion),
        _fila("Acompañante", f"{_valor(historia.acompanante)} ({_valor(historia.parentesco_acompanante)}) Tel: {_valor(historia.telefono_acompanante)}"),
        _fila("Responsable", f"{_valor(historia.responsable)} ({_valor(historia.parentesco_responsable)}) Tel: {_valor(historia.telefono_responsable)}"),
    ]))

    elementos.append(_seccion("2. DATOS DE ATENCIÓN"))
    elementos.append(_tabla_datos([
        _fila("Motivo de consulta", historia.motivo_consulta),
        _fila("Enfermedad actual", historia.enfermedad_actual),
    ]))

    elementos.append(PageBreak())

    elementos.append(_seccion("3. ANTECEDENTES"))
    elementos.append(_tabla_datos([
        _fila("Alergias", historia.alergias),
        _fila("Traumatológicos", historia.antecedentes_traumatologicos),
        _fila("Quirúrgicos", historia.antecedentes_quirurgicos),
    ]))

    elementos.append(_seccion("4. SIGNOS VITALES"))
    elementos.append(Paragraph(_dict_a_texto(historia.signos_vitales), texto_style))
    elementos.append(Spacer(1, 6))

    elementos.append(_seccion("5. EXAMEN POR SISTEMAS"))
    elementos.append(Paragraph(_dict_a_texto(historia.examen_sistema_fisico), texto_style))
    elementos.append(Spacer(1, 6))

    elementos.append(_seccion("6. EXAMEN FÍSICO SEGMENTARIO"))
    elementos.append(Paragraph(_dict_a_texto(historia.examen_fisico), texto_style))

    elementos.append(PageBreak())

    elementos.append(_seccion("7. VALORACIÓN MÉDICA Y DIAGNÓSTICOS"))
    elementos.append(_tabla_datos([
        _fila_justificada("Valoración médica", historia.valoracion_medica),
        _fila_dx("Diagnóstico principal", historia.diagnostico_principal),
        _fila_dx("Diagnóstico relacionado 1", historia.diagnostico_relacionado_1),
        _fila_dx("Diagnóstico relacionado 2", historia.diagnostico_relacionado_2),
        _fila_dx("Diagnóstico relacionado 3", historia.diagnostico_relacionado_3),
        _fila("Causa externa", historia.causa_externa),
        _fila("Tipo de diagnóstico", historia.tipo_diagnostico),
        _fila("Finalidad", historia.finalidad),
    ]))

    elementos.append(_seccion("8. INCAPACIDAD Y APOYO DIAGNÓSTICO"))
    elementos.append(_tabla_datos([
        _fila("Incapacidad", historia.incapacidad),
        _fila("Solicitudes de apoyo diagnóstico", historia.solicitudes_apoyo_diagnostico),
    ]))
    elementos.append(Spacer(1, 4))
    elementos.append(_lista_apoyo_diagnostico(historia.apoyo_diagnostico))

    elementos.append(_seccion("9. MEDICAMENTOS Y RECOMENDACIONES"))
    elementos.append(_lista_medicamentos(historia.medicamentos))
    elementos.append(Spacer(1, 6))
    elementos.append(_tabla_datos([
        _fila("Solicitudes de medicamentos", historia.solicitudes_medicamentos),
        _fila_justificada("Recomendaciones", historia.recomendaciones),
    ]))

    doc.build(elementos, canvasmaker=_CanvasConNumeracion)
    return buffer.getvalue()