"""
Modelo de auditoria: registra quien hizo que accion sobre cada historia.
"""
from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, func

from app.db.session import Base


class HistorialCambio(Base):
    __tablename__ = "historial_cambios"

    id = Column(Integer, primary_key=True, index=True)
    historia_id = Column(Integer, ForeignKey("historias_clinicas.id"), nullable=False, index=True)
    medico_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    accion = Column(String(50), nullable=False)
    detalle = Column(String(255), nullable=True)
    fecha = Column(TIMESTAMP, nullable=False, server_default=func.now())