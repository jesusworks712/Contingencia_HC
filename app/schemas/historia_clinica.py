"""
Schemas Pydantic para historias clinicas.
"""
from datetime import date, datetime
from typing import Optional, List

from pydantic import BaseModel


class Modulo1Paciente(BaseModel):
    fecha_atencion: Optional[datetime] = None
    paciente_nombre: Optional[str] = None
    paciente_tipo_identificacion: Optional[str] = None
    paciente_cedula: Optional[str] = None
    paciente_sexo: Optional[str] = None
    paciente_fecha_nacimiento: Optional[date] = None
    paciente_ocupacion: Optional[str] = None
    paciente_direccion: Optional[str] = None
    paciente_telefono: Optional[str] = None
    paciente_ciudad_residencia: Optional[str] = None
    paciente_regimen: Optional[str] = None
    paciente_convenio: Optional[str] = None
    paciente_asegurador: Optional[str] = None
    paciente_rango: Optional[str] = None
    paciente_estado_civil: Optional[str] = None
    paciente_discapacidad: Optional[str] = None
    paciente_etnia: Optional[str] = None
    paciente_religion: Optional[str] = None
    paciente_poblacion: Optional[str] = None
    acompanante: Optional[str] = None
    parentesco_acompanante: Optional[str] = None
    telefono_acompanante: Optional[str] = None
    responsable: Optional[str] = None
    parentesco_responsable: Optional[str] = None
    telefono_responsable: Optional[str] = None


class Modulo2Atencion(BaseModel):
    motivo_consulta: Optional[str] = None
    enfermedad_actual: Optional[str] = None


class Modulo3Antecedentes(BaseModel):
    alergias: Optional[str] = None
    antecedentes_traumatologicos: Optional[str] = None
    antecedentes_quirurgicos: Optional[str] = None


class Modulo456Examenes(BaseModel):
    examen_sistema_fisico: Optional[dict] = None
    signos_vitales: Optional[dict] = None
    examen_fisico: Optional[dict] = None


class Modulo7Diagnosticos(BaseModel):
    valoracion_medica: Optional[str] = None
    diagnostico_principal: Optional[str] = None
    diagnostico_relacionado_1: Optional[str] = None
    diagnostico_relacionado_2: Optional[str] = None
    diagnostico_relacionado_3: Optional[str] = None
    causa_externa: Optional[str] = None
    tipo_diagnostico: Optional[str] = None
    finalidad: Optional[str] = None


class ApoyoDiagnosticoItem(BaseModel):
    codigo: Optional[str] = None
    cantidad: Optional[int] = None
    nombre: Optional[str] = None
    observacion: Optional[str] = None


class Modulo8Incapacidad(BaseModel):
    incapacidad: Optional[str] = None
    apoyo_diagnostico: Optional[List[ApoyoDiagnosticoItem]] = None
    solicitudes_apoyo_diagnostico: Optional[str] = None


class MedicamentoItem(BaseModel):
    id: Optional[str] = None
    nombre: Optional[str] = None
    presentacion: Optional[str] = None
    dosis: Optional[str] = None
    horas: Optional[str] = None
    cantidad: Optional[str] = None
    dias: Optional[str] = None
    indicaciones: Optional[str] = None


class Modulo9Medicamentos(BaseModel):
    medicamentos: Optional[List[MedicamentoItem]] = None
    solicitudes_medicamentos: Optional[str] = None
    recomendaciones: Optional[str] = None


class HistoriaClinicaUpsert(
    Modulo1Paciente,
    Modulo2Atencion,
    Modulo3Antecedentes,
    Modulo456Examenes,
    Modulo7Diagnosticos,
    Modulo8Incapacidad,
    Modulo9Medicamentos,
):
    modulo_actual: Optional[int] = None


class HistoriaClinicaOut(HistoriaClinicaUpsert):
    id: int
    medico_id: int
    fecha_atencion: datetime
    estado: str
    creado_en: datetime
    actualizado_en: datetime
    finalizado_en: Optional[datetime] = None
    transcrita_a_pana: bool = False
    transcrita_a_pana_en: Optional[datetime] = None

    class Config:
        from_attributes = True


class HistoriaClinicaResumen(BaseModel):
    id: int
    paciente_nombre: Optional[str] = None
    paciente_tipo_identificacion: Optional[str] = None
    paciente_cedula: Optional[str] = None
    estado: str
    fecha_atencion: datetime
    medico_id: int
    medico_nombre: Optional[str] = None
    transcrita_a_pana: bool = False

    class Config:
        from_attributes = True

class HistorialCambioOut(BaseModel):
    id: int
    accion: str
    detalle: Optional[str] = None
    fecha: datetime
    medico_id: int
    medico_nombre: Optional[str] = None

    class Config:
        from_attributes = True