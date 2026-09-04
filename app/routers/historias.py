"""
Endpoints de historias clinicas.

- Un medico normal solo puede ver, buscar, editar, finalizar y
  descargar el PDF de las historias que EL MISMO creo.
- Un administrador puede ver, buscar y descargar el PDF de las
  historias de CUALQUIER medico, pero editar y finalizar sigue
  siendo exclusivo del medico que creo cada historia.
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.deps import get_current_medico
from app.db.session import get_db
from app.models.historia_clinica import HistoriaClinica
from app.models.usuario import Usuario
from app.schemas.historia_clinica import (
    HistoriaClinicaUpsert,
    HistoriaClinicaOut,
    HistoriaClinicaResumen,
)
from app.services.pdf_generator import generar_pdf_historia

router = APIRouter(prefix="/historias", tags=["Historias Clinicas"])


def _obtener_historia_propia_o_404(historia_id: int, medico_actual: Usuario, db: Session) -> HistoriaClinica:
    """
    Trae la historia solo si pertenece al medico logueado.
    Si existe pero es de otro medico, igual devuelve 404 (no 403) para
    no revelar que la historia existe.

    Se usa para EDITAR y FINALIZAR: estas acciones siguen siendo
    exclusivas del medico que creo la historia, incluso si quien
    esta logueado es administrador.
    """
    historia = (
        db.query(HistoriaClinica)
        .filter(
            HistoriaClinica.id == historia_id,
            HistoriaClinica.medico_id == medico_actual.id,
        )
        .first()
    )
    if not historia:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Historia no encontrada")
    return historia


def _obtener_historia_visible_o_404(historia_id: int, medico_actual: Usuario, db: Session) -> HistoriaClinica:
    """
    Trae la historia para VER (detalle o PDF). Si el usuario es admin,
    puede ver la historia de cualquier medico; si es medico normal,
    solo la propia.
    """
    query = db.query(HistoriaClinica).filter(HistoriaClinica.id == historia_id)
    if not medico_actual.es_admin:
        query = query.filter(HistoriaClinica.medico_id == medico_actual.id)

    historia = query.first()
    if not historia:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Historia no encontrada")
    return historia


@router.post("", response_model=HistoriaClinicaOut, status_code=status.HTTP_201_CREATED)
def crear_historia(
    datos: HistoriaClinicaUpsert,
    medico_actual: Usuario = Depends(get_current_medico),
    db: Session = Depends(get_db),
):
    nueva_historia = HistoriaClinica(
        medico_id=medico_actual.id,
        **datos.model_dump(exclude_unset=True),
    )
    db.add(nueva_historia)
    db.commit()
    db.refresh(nueva_historia)
    return nueva_historia


@router.get("", response_model=List[HistoriaClinicaResumen])
def buscar_historias(
    buscar: Optional[str] = Query(default=None, description="Texto a buscar en cedula o nombre del paciente"),
    estado: Optional[str] = Query(default=None, description="Filtrar por estado: 'borrador' o 'completa'"),
    medico_id: Optional[int] = Query(
        default=None,
        description="SOLO para administradores: filtrar por un medico especifico. Se ignora si quien consulta no es admin.",
    ),
    medico_actual: Usuario = Depends(get_current_medico),
    db: Session = Depends(get_db),
):
    """
    Busca historias por cedula o nombre.

    - Un medico normal SOLO ve las historias que el mismo creo.
    - Un administrador ve las historias de TODOS los medicos, y puede
      opcionalmente filtrar por un medico_id especifico.
    """
    query = db.query(HistoriaClinica, Usuario.nombre_completo).join(
        Usuario, HistoriaClinica.medico_id == Usuario.id
    )

    if medico_actual.es_admin:
        if medico_id is not None:
            query = query.filter(HistoriaClinica.medico_id == medico_id)
    else:
        query = query.filter(HistoriaClinica.medico_id == medico_actual.id)

    if buscar:
        patron = f"%{buscar}%"
        query = query.filter(
            or_(
                HistoriaClinica.paciente_cedula.ilike(patron),
                HistoriaClinica.paciente_nombre.ilike(patron),
            )
        )

    if estado:
        query = query.filter(HistoriaClinica.estado == estado)

    filas = query.order_by(HistoriaClinica.fecha_atencion.desc()).limit(100).all()

    resultados = []
    for historia, nombre_medico in filas:
        resumen = HistoriaClinicaResumen.model_validate(historia)
        resumen.medico_nombre = nombre_medico
        resultados.append(resumen)
    return resultados


@router.get("/{historia_id}", response_model=HistoriaClinicaOut)
def obtener_historia(
    historia_id: int,
    medico_actual: Usuario = Depends(get_current_medico),
    db: Session = Depends(get_db),
):
    return _obtener_historia_visible_o_404(historia_id, medico_actual, db)


@router.put("/{historia_id}", response_model=HistoriaClinicaOut)
def actualizar_historia(
    historia_id: int,
    datos: HistoriaClinicaUpsert,
    medico_actual: Usuario = Depends(get_current_medico),
    db: Session = Depends(get_db),
):
    historia = _obtener_historia_propia_o_404(historia_id, medico_actual, db)

    if historia.estado == "completa":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta historia ya esta finalizada y no se puede editar",
        )

    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(historia, campo, valor)

    db.commit()
    db.refresh(historia)
    return historia


@router.put("/{historia_id}/finalizar", response_model=HistoriaClinicaOut)
def finalizar_historia(
    historia_id: int,
    medico_actual: Usuario = Depends(get_current_medico),
    db: Session = Depends(get_db),
):
    from datetime import datetime, timezone

    historia = _obtener_historia_propia_o_404(historia_id, medico_actual, db)

    if historia.estado == "completa":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Esta historia ya estaba finalizada")

    if not historia.paciente_nombre or not historia.paciente_cedula:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede finalizar sin nombre y cedula del paciente (Modulo 1)",
        )

    historia.estado = "completa"
    historia.finalizado_en = datetime.now(timezone.utc)
    db.commit()
    db.refresh(historia)
    return historia


@router.get("/{historia_id}/pdf")
def exportar_historia_pdf(
    historia_id: int,
    medico_actual: Usuario = Depends(get_current_medico),
    db: Session = Depends(get_db),
):
    historia = _obtener_historia_visible_o_404(historia_id, medico_actual, db)

    medico_de_la_historia = db.query(Usuario).filter(Usuario.id == historia.medico_id).first()
    nombre_medico_pdf = medico_de_la_historia.nombre_completo if medico_de_la_historia else medico_actual.nombre_completo

    pdf_bytes = generar_pdf_historia(historia, nombre_medico_pdf)

    nombre_archivo = f"historia_{historia.id}"
    if historia.paciente_cedula:
        nombre_archivo += f"_{historia.paciente_cedula}"
    nombre_archivo += ".pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{nombre_archivo}"'},
    )