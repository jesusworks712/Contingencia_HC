"""
Modelo SQLAlchemy que mapea la tabla `usuarios` (medicos que inician sesion).
"""
from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, func

from app.db.session import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre_completo = Column(String(150), nullable=False)
    registro_medico = Column(String(50), nullable=False)
    especialidad = Column(String(150), nullable=False, default="MEDICINA FISICA Y REHABILITACION")
    usuario = Column(String(50), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    activo = Column(Boolean, nullable=False, default=True)
    es_admin = Column(Boolean, nullable=False, default=False)
    creado_en = Column(TIMESTAMP, nullable=False, server_default=func.now())
