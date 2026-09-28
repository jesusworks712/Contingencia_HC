"""
Modelo SQLAlchemy que mapea la tabla `historias_clinicas`.
Coincide exactamente con el script SQL que ya ejecutaste (los 9 modulos del PDF).
"""
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Date,
    TIMESTAMP,
    ForeignKey,
    Boolean,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB

from app.db.session import Base


class HistoriaClinica(Base):
    __tablename__ = "historias_clinicas"

    id = Column(Integer, primary_key=True, index=True)
    medico_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    fecha_atencion = Column(TIMESTAMP, nullable=False, server_default=func.now())
    estado = Column(String(20), nullable=False, default="borrador")  # 'borrador' | 'completa'
    modulo_actual = Column(Integer, nullable=False, default=1)

    # Modulo 1: Identificacion del paciente
    paciente_nombre = Column(String(200))
    paciente_tipo_identificacion = Column(String(5))
    paciente_cedula = Column(String(30), index=True)
    paciente_sexo = Column(String(20))
    paciente_fecha_nacimiento = Column(Date)
    paciente_ocupacion = Column(String(150))
    paciente_direccion = Column(String(255))
    paciente_telefono = Column(String(50))
    paciente_ciudad_residencia = Column(String(100))
    paciente_regimen = Column(String(100))
    paciente_convenio = Column(String(150))
    paciente_asegurador = Column(String(150))
    paciente_rango = Column(String(100))
    paciente_estado_civil = Column(String(50))
    paciente_discapacidad = Column(String(150))
    paciente_etnia = Column(String(100))
    paciente_religion = Column(String(100))
    paciente_poblacion = Column(String(100))
    acompanante = Column(String(150))
    parentesco_acompanante = Column(String(100))
    telefono_acompanante = Column(String(50))
    responsable = Column(String(150))
    parentesco_responsable = Column(String(100))
    telefono_responsable = Column(String(50))

    # Modulo 2: Datos de atencion
    motivo_consulta = Column(Text)
    enfermedad_actual = Column(Text)

    # Modulo 3: Antecedentes
    alergias = Column(Text)
    antecedentes_traumatologicos = Column(Text)
    antecedentes_quirurgicos = Column(Text)

    # Modulo 4: Examen sistema fisico (JSON)
    examen_sistema_fisico = Column(JSONB)

    # Modulo 5: Signos vitales (JSON)
    signos_vitales = Column(JSONB)

    # Modulo 6: Examen fisico segmentario (JSON)
    examen_fisico = Column(JSONB)

    # Modulo 7: Valoracion medica y diagnosticos
    valoracion_medica = Column(Text)
    diagnostico_principal = Column(String(255))
    diagnostico_relacionado_1 = Column(String(255))
    diagnostico_relacionado_2 = Column(String(255))
    diagnostico_relacionado_3 = Column(String(255))
    causa_externa = Column(String(255))
    tipo_diagnostico = Column(String(100))
    finalidad = Column(String(255))

    # Modulo 8: Incapacidad y apoyo diagnostico
    incapacidad = Column(Text)
    apoyo_diagnostico = Column(JSONB)
    solicitudes_apoyo_diagnostico = Column(Text)

    # Modulo 9: Medicamentos y recomendaciones
    medicamentos = Column(JSONB)
    solicitudes_medicamentos = Column(Text)
    recomendaciones = Column(Text)

    # Control y trazabilidad
    creado_en = Column(TIMESTAMP, nullable=False, server_default=func.now())
    actualizado_en = Column(TIMESTAMP, nullable=False, server_default=func.now())
    finalizado_en = Column(TIMESTAMP, nullable=True)
    transcrita_a_pana = Column(Boolean, nullable=False, default=False)
    transcrita_a_pana_en = Column(TIMESTAMP, nullable=True)