"""
crear_historia_prueba_2.py
────────────────────────
Inserta una segunda historia clínica de prueba COMPLETA
asociada al médico Victor Florez en la base de datos.

Ejecutar desde la carpeta raíz del proyecto (donde está el .env):

    cd C:\\Users\\Admin\\Documents\\Contingencia_HC
    python crear_historia_prueba_2.py
"""

import sys
import json
from datetime import date, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from app.core.config import settings
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

engine = create_engine(settings.DATABASE_URL)
Session = sessionmaker(bind=engine)

with Session() as db:
    fila = db.execute(
        text("SELECT id, nombre_completo FROM usuarios WHERE LOWER(nombre_completo) LIKE '%victor%florez%' LIMIT 1")
    ).fetchone()

    if not fila:
        fila = db.execute(
            text("SELECT id, nombre_completo FROM usuarios WHERE LOWER(nombre_completo) LIKE '%florez%' LIMIT 1")
        ).fetchone()

    if not fila:
        print("\n❌  No se encontró un usuario 'Victor Florez' en la base de datos.")
        sys.exit(1)

    medico_id = fila.id
    print(f"\n✅  Médico encontrado: id={medico_id}  nombre={fila.nombre_completo}")

signos_vitales = {
    "peso": "68",
    "talla": "162",
    "temperatura": "36.7",
    "tension_arterial": "118/76",
    "frecuencia_cardiaca": "70",
    "frecuencia_respiratoria": "15",
    "saturacion_oxigeno": "98%",
    "clasificacion_imc": "Normal",
}

examen_sistema_fisico = {
    "cara": "Simétrica, sin lesiones",
    "cuello": "Móvil, sin adenopatías",
    "torax": "Simétrico, buena expansión bilateral",
    "abdomen": "Blando, depresible, no doloroso",
    "extremidades": "Sin edemas, pulsos distales presentes",
    "neurologico": "Alerta, orientada, Lasègue positivo izquierdo",
    "piel": "Normocoloreada, sin lesiones",
}

examen_fisico = {
    "cabeza": "Normocéfala, sin alteraciones",
    "ojos": "Pupilas isocóricas reactivas",
    "oidos": "Conducto auditivo permeable",
    "nariz": "Sin secreciones",
    "boca": "Mucosa oral húmeda",
    "cuello": "Sin masas palpables",
    "torax": "Murmullo vesicular conservado",
    "abdomen": "Ruidos intestinales presentes",
    "columna": "Dolor a la palpación en L4-L5, contractura paravertebral lumbar izquierda",
    "extremidades_superiores": "Fuerza muscular 5/5",
    "extremidades_inferiores": "Fuerza 4/5 en miembro inferior izquierdo, reflejo aquiliano disminuido",
    "genitourinario": "No evaluado en esta consulta",
}

apoyo_diagnostico_cups = [
    {
        "codigo": "890363",
        "nombre": "RESONANCIA MAGNETICA COLUMNA LUMBAR",
        "cantidad": 1,
        "observacion": "Para descartar hernia discal y compromiso radicular",
    },
    {
        "codigo": "870108",
        "nombre": "RADIOGRAFIA COLUMNA LUMBOSACRA AP Y LATERAL",
        "cantidad": 1,
        "observacion": "Valoración inicial de estructura ósea",
    },
]

medicamentos = [
    {
        "nombre": "Naproxeno",
        "presentacion": "Tableta 500mg",
        "dosis": "1 tableta",
        "horas": "12",
        "cantidad": "14",
        "dias": "7",
        "indicaciones": "Tomar con alimentos, suspender si presenta molestias gástricas",
    },
    {
        "nombre": "Pregabalina",
        "presentacion": "Cápsula 75mg",
        "dosis": "1 cápsula",
        "horas": "24",
        "cantidad": "10",
        "dias": "10",
        "indicaciones": "Tomar en la noche, puede causar somnolencia",
    },
]

historia_data = {
    "medico_id": medico_id,
    "fecha_atencion": datetime(2026, 9, 24, 9, 0),
    "estado": "completa",
    "modulo_actual": 9,
    "paciente_nombre": "María Fernanda Zúñiga Ordóñez",
    "paciente_tipo_identificacion": "CC",
    "paciente_cedula": "1061098765",
    "paciente_sexo": "Femenino",
    "paciente_fecha_nacimiento": date(1988, 11, 2),
    "paciente_ocupacion": "Docente",
    "paciente_direccion": "Carrera 8 # 15-40, Popayán",
    "paciente_telefono": "3157894561",
    "paciente_ciudad_residencia": "Popayán",
    "paciente_regimen": "Contributivo",
    "paciente_convenio": "N/A",
    "paciente_asegurador": "Nueva EPS",
    "paciente_rango": None,
    "paciente_estado_civil": "Soltera",
    "paciente_discapacidad": "Ninguna",
    "paciente_etnia": "Mestiza",
    "paciente_religion": "Católica",
    "paciente_poblacion": None,
    "acompanante": None,
    "parentesco_acompanante": None,
    "telefono_acompanante": None,
    "responsable": None,
    "parentesco_responsable": None,
    "telefono_responsable": None,
    "motivo_consulta": "Dolor lumbar irradiado a miembro inferior izquierdo de 10 días de evolución.",
    "enfermedad_actual": (
        "Paciente femenina de 37 años, docente, que consulta por dolor lumbar de inicio "
        "súbito tras cargar objeto pesado hace 10 días, con irradiación a miembro inferior "
        "izquierdo siguiendo trayecto ciático. Refiere parestesias ocasionales en cara "
        "lateral de la pierna. Dolor de intensidad 7/10, exacerbado con la sedestación "
        "prolongada y la flexión del tronco. Ha manejado con acetaminofén sin mejoría "
        "significativa. Niega fiebre, pérdida de peso, alteración de esfínteres."
    ),
    "alergias": "No refiere alergias medicamentosas conocidas.",
    "antecedentes_traumatologicos": "Ninguno relevante.",
    "antecedentes_quirurgicos": "Ninguno.",
    "examen_sistema_fisico": examen_sistema_fisico,
    "signos_vitales": signos_vitales,
    "examen_fisico": examen_fisico,
    "valoracion_medica": (
        "Paciente con cuadro clínico y hallazgos al examen físico compatibles con "
        "lumbociatalgia izquierda de probable origen discal. Se sugiere manejo "
        "conservador inicial con terapia física, analgesia y estudios de imagen para "
        "descartar compromiso radicular significativo. Control en 2 semanas para "
        "evaluar evolución."
    ),
    "diagnostico_principal": "M54.4 Lumbago con ciática",
    "diagnostico_relacionado_1": "M51.1 Trastornos de disco lumbar con radiculopatía",
    "diagnostico_relacionado_2": None,
    "diagnostico_relacionado_3": None,
    "causa_externa": "Enfermedad general",
    "tipo_diagnostico": "Impresión diagnóstica",
    "finalidad": "Diagnóstico",
    "incapacidad": "Sin incapacidad por el momento, se reevaluará en control.",
    "apoyo_diagnostico": apoyo_diagnostico_cups,
    "solicitudes_apoyo_diagnostico": "Se solicita autorización de resonancia magnética por EPS de manera prioritaria.",
    "medicamentos": medicamentos,
    "solicitudes_medicamentos": "Se solicita a la EPS autorización de terapia física ambulatoria, 10 sesiones.",
    "recomendaciones": (
        "Reposo relativo evitando cargar peso, evitar sedestación prolongada mayor a 30 "
        "minutos, aplicar calor local en zona lumbar, iniciar terapia física una vez "
        "autorizada, control por consulta externa en 15 días con resultado de resonancia "
        "magnética, acudir a urgencias si presenta pérdida de fuerza progresiva o "
        "alteración de esfínteres."
    ),
    "finalizado_en": datetime(2026, 9, 24, 9, 30),
}

cols = ", ".join(historia_data.keys())
params = ", ".join(f":{k}" for k in historia_data.keys())

sql = text(f"""
    INSERT INTO historias_clinicas ({cols})
    VALUES ({params})
    RETURNING id
""")

for campo in ("examen_sistema_fisico", "signos_vitales", "examen_fisico", "apoyo_diagnostico", "medicamentos"):
    if isinstance(historia_data.get(campo), (dict, list)):
        historia_data[campo] = json.dumps(historia_data[campo], ensure_ascii=False)

with Session() as db:
    result = db.execute(sql, historia_data)
    historia_id = result.scalar()
    db.commit()

print(f"\n✅  Historia clínica creada exitosamente.")
print(f"    ID:       {historia_id}")
print(f"    Paciente: {historia_data['paciente_nombre']}")
print(f"    Cédula:   {historia_data['paciente_cedula']}")
print(f"    Médico:   Victor Florez (id={medico_id})")
print(f"    Estado:   COMPLETA")
print(f"\n    → Ingrese al sistema con Victor Florez y búsquela por cédula: 1061098765")
print(f"    → O vaya directo a: http://localhost:8010  y busque 'Zúñiga'\n")