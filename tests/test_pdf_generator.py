"""
Test de humo: genera un PDF con datos dummy y falla si algo revienta.
Ejecutar con: pytest tests/test_pdf_generator.py
"""
from datetime import date, datetime
from types import SimpleNamespace

from app.services.pdf_generator import generar_pdf_historia


def _historia_dummy():
    return SimpleNamespace(
        id=999,
        medico_id=1,
        fecha_atencion=datetime(2026, 1, 15, 10, 30),
        estado="completa",
        modulo_actual=9,
        paciente_nombre="Paciente de Prueba",
        paciente_tipo_identificacion="CC",
        paciente_cedula="1061789456",
        paciente_sexo="Femenino",
        paciente_fecha_nacimiento=date(1990, 5, 20),
        paciente_ocupacion="Ingeniera",
        paciente_direccion="Calle Falsa 123",
        paciente_telefono="3000000000",
        paciente_ciudad_residencia="Popayán",
        paciente_regimen="Contributivo",
        paciente_convenio="N/A",
        paciente_asegurador="EPS Ejemplo",
        paciente_estado_civil="Soltera",
        paciente_discapacidad=None,
        paciente_etnia="Mestiza",
        paciente_religion=None,
        acompanante=None,
        parentesco_acompanante=None,
        telefono_acompanante=None,
        responsable=None,
        parentesco_responsable=None,
        telefono_responsable=None,
        motivo_consulta="Control de rutina",
        enfermedad_actual="Sin novedad",
        alergias="Ninguna conocida",
        antecedentes_traumatologicos=None,
        antecedentes_quirurgicos=None,
        examen_sistema_fisico={"cardiovascular": "Normal", "respiratorio": "Normal"},
        signos_vitales={"ta": "120/80", "fc": "72", "fr": "16", "temp": "36.5"},
        examen_fisico={"piel": "Sin lesiones"},
        valoracion_medica="Paciente estable",
        diagnostico_principal="Z00.0 Examen médico general",
        diagnostico_relacionado_1=None,
        diagnostico_relacionado_2=None,
        diagnostico_relacionado_3=None,
        causa_externa=None,
        tipo_diagnostico="Nuevo",
        finalidad="Control",
        incapacidad=None,
        apoyo_diagnostico=[{"codigo": "890201", "cantidad": "1", "nombre": "Hemograma", "observacion": ""}],
        solicitudes_apoyo_diagnostico=None,
        medicamentos=[{"nombre": "Acetaminofén", "presentacion": "Tableta 500mg", "dosis": "1", "horas": "8", "cantidad": "10", "dias": "3", "indicaciones": "Con alimentos"}],
        solicitudes_medicamentos=None,
        recomendaciones="Control en 30 días",
    )


def test_generar_pdf_historia_no_lanza_excepcion():
    historia = _historia_dummy()
    resultado = generar_pdf_historia(historia, nombre_medico="Dr. Prueba")
    assert isinstance(resultado, bytes)
    assert resultado.startswith(b"%PDF")
    assert len(resultado) > 1000


def test_generar_pdf_historia_con_fecha_atencion_nula():
    historia = _historia_dummy()
    historia.fecha_atencion = None
    resultado = generar_pdf_historia(historia, nombre_medico="Dr. Prueba")
    assert resultado.startswith(b"%PDF")