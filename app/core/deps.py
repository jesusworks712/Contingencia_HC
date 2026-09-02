"""
Dependencias reutilizables de FastAPI, principalmente autenticacion.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.usuario import Usuario

# tokenUrl apunta al endpoint de login (solo para que Swagger sepa donde pedirlo)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_medico(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Usuario:
    """
    Lee el token JWT del header Authorization, lo valida y devuelve
    el medico correspondiente. Se usa como dependencia en cualquier
    endpoint que deba estar protegido (todo excepto /auth/login).
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar la sesion",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    usuario_str = payload.get("sub")
    if usuario_str is None:
        raise credentials_exception

    medico = db.query(Usuario).filter(Usuario.usuario == usuario_str).first()
    if medico is None or not medico.activo:
        raise credentials_exception

    return medico


def get_current_admin(
    medico_actual: Usuario = Depends(get_current_medico),
) -> Usuario:
    """
    Igual que get_current_medico, pero ademas exige que el usuario
    tenga permisos de administrador (es_admin = True). Se usa para
    proteger endpoints como el registro de medicos nuevos.
    """
    if not medico_actual.es_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Esta accion requiere permisos de administrador",
        )
    return medico_actual
