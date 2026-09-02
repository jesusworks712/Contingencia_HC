"""
Schemas Pydantic relacionados con login, tokens y registro de medicos.
"""
from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    usuario: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MedicoOut(BaseModel):
    id: int
    nombre_completo: str
    registro_medico: str
    especialidad: str
    usuario: str
    activo: bool
    es_admin: bool

    class Config:
        from_attributes = True


class MedicoCreate(BaseModel):
    """Datos para registrar un medico nuevo desde la aplicacion."""
    nombre_completo: str = Field(..., min_length=3)
    registro_medico: str = Field(..., min_length=1)
    especialidad: str = "MEDICINA FISICA Y REHABILITACION"
    usuario: str = Field(..., min_length=3)
    password: str = Field(..., min_length=4)


class MedicoEstadoUpdate(BaseModel):
    """Datos para activar o inactivar un medico existente."""
    activo: bool