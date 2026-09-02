"""
Endpoints de autenticacion: login de medicos y registro de medicos nuevos
(este ultimo restringido a administradores).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.deps import get_current_medico, get_current_admin
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.usuario import Usuario
from app.schemas.auth import TokenResponse, MedicoOut, MedicoCreate, MedicoEstadoUpdate

router = APIRouter(prefix="/auth", tags=["Autenticacion"])


@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Login de un medico. Usa el formato estandar OAuth2 (form-data, no JSON)
    para que el boton "Authorize" de Swagger funcione directo.
    form_data.username = el campo "usuario" del medico.
    """
    medico = db.query(Usuario).filter(Usuario.usuario == form_data.username).first()

    if not medico or not verify_password(form_data.password, medico.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseÃ±a incorrectos",
        )

    if not medico.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Este usuario esta inactivo",
        )

    token = create_access_token(data={"sub": medico.usuario})
    return TokenResponse(access_token=token)


@router.get("/yo", response_model=MedicoOut)
def perfil_actual(medico_actual: Usuario = Depends(get_current_medico)):
    """
    Devuelve los datos del medico autenticado, incluyendo si es
    administrador o no (el frontend usa esto para mostrar/ocultar
    la pantalla de registro de medicos).
    """
    return medico_actual


@router.post("/medicos", response_model=MedicoOut, status_code=status.HTTP_201_CREATED)
def registrar_medico(
    datos: MedicoCreate,
    admin_actual: Usuario = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Registra un medico nuevo en el sistema.
    SOLO puede hacerlo un usuario con permisos de administrador.
    """
    ya_existe = db.query(Usuario).filter(Usuario.usuario == datos.usuario).first()
    if ya_existe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ese nombre de usuario ya esta registrado",
        )

    nuevo_medico = Usuario(
        nombre_completo=datos.nombre_completo,
        registro_medico=datos.registro_medico,
        especialidad=datos.especialidad,
        usuario=datos.usuario,
        password_hash=hash_password(datos.password),
        es_admin=False,  # los medicos creados desde aqui nunca son admin por defecto
    )
    db.add(nuevo_medico)
    db.commit()
    db.refresh(nuevo_medico)
    return nuevo_medico


@router.get("/medicos", response_model=list[MedicoOut])
def listar_medicos(
    admin_actual: Usuario = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Lista todos los medicos registrados. SOLO para administradores."""
    return db.query(Usuario).order_by(Usuario.nombre_completo).all()


@router.patch("/medicos/{medico_id}/estado", response_model=MedicoOut)
def cambiar_estado_medico(
    medico_id: int,
    datos: MedicoEstadoUpdate,
    admin_actual: Usuario = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Activa o inactiva a un medico. SOLO para administradores.
    Un medico inactivo no puede iniciar sesion (ver login()).
    """
    medico_objetivo = db.query(Usuario).filter(Usuario.id == medico_id).first()
    if not medico_objetivo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medico no encontrado")

    if medico_objetivo.id == admin_actual.id and not datos.activo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes inactivar tu propio usuario",
        )

    medico_objetivo.activo = datos.activo
    db.commit()
    db.refresh(medico_objetivo)
    return medico_objetivo