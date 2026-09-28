"""
Constantes compartidas para historias clínicas.
Única fuente de verdad para el backend (PDF, validaciones, API, etc).

Listas normativas según Resolución 3374 de 2000 (RIPS) del Ministerio de Salud.
"""

# ── Tipos de identificación (MSPS) ────────────────────────────────────────
TIPOS_IDENTIFICACION = {
    "RC": "Registro Civil",
    "TI": "Tarjeta de Identidad",
    "CC": "Cédula de Ciudadanía",
    "CE": "Cédula de Extranjería",
    "PA": "Pasaporte",
    "SC": "Salvoconducto",
    "CD": "Carné Diplomático",
    "PE": "Permiso Especial de Permanencia (PEP)",
    "PT": "Permiso por Protección Temporal (PPT)",
    "CN": "Certificado de Nacido Vivo",
    "DE": "Documento Extranjero",
    "MS": "Menor sin Identificación",
    "AS": "Adulto sin Identificación",
}

# ── Sexo — HC de contingencia (mínimo normativo) ──────────────────────────
SEXOS = ["Masculino", "Femenino"]

# ── Causa Externa (Res. 3374/2000 — RIPS) ────────────────────────────────
CAUSAS_EXTERNAS = [
    "Accidente de trabajo",
    "Accidente de tránsito",
    "Accidente rábico",
    "Accidente ofídico",
    "Otro tipo de accidente",
    "Evento catastrófico",
    "Lesión por agresión",
    "Lesión auto infligida",
    "Sospecha de maltrato físico",
    "Sospecha de abuso sexual",
    "Sospecha de violencia sexual",
    "Sospecha de maltrato emocional",
    "Enfermedad general",
    "Enfermedad laboral",
    "Otra",
]

# ── Tipo de diagnóstico (Res. 3374/2000 — RIPS) ──────────────────────────
TIPOS_DIAGNOSTICO = [
    "Impresión diagnóstica",
    "Confirmado nuevo",
    "Confirmado repetido",
]

# ── Finalidad de la consulta (Res. 3374/2000 — RIPS) ─────────────────────
FINALIDADES = [
    "Diagnóstico",
    "Tratamiento médico",
    "Tratamiento quirúrgico",
    "Tratamiento rehabilitación física",
    "Tratamiento rehabilitación mental",
    "Detección de alteraciones de crecimiento y desarrollo",
    "Detección de alteraciones del joven",
    "Detección de alteraciones del adulto",
    "Detección de alteraciones del anciano",
    "Detección de alteraciones de agudeza visual",
    "Control prenatal",
    "Atención del parto",
    "Atención del recién nacido",
    "Atención en planificación familiar",
    "Atención preventiva en salud bucal",
    "Atención curativa en salud bucal",
]