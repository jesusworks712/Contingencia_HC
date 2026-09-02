"""
Script de utilidad para crear un medico con password hasheado de verdad
(el INSERT del script SQL original traia un hash de ejemplo que NO sirve).

Uso:
    python crear_medico.py
Y sigue las instrucciones interactivas.
"""
from getpass import getpass

from app.db.session import SessionLocal
from app.core.security import hash_password
from app.models.usuario import Usuario


def main():
    db = SessionLocal()
    try:
        print("=== Crear nuevo medico ===")
        nombre_completo = input("Nombre completo: ").strip()
        registro_medico = input("Registro medico: ").strip()
        especialidad = input("Especialidad [MEDICINA FISICA Y REHABILITACION]: ").strip() \
            or "MEDICINA FISICA Y REHABILITACION"
        usuario = input("Usuario (para login): ").strip()
        password = getpass("Contraseña: ")

        existente = db.query(Usuario).filter(Usuario.usuario == usuario).first()
        if existente:
            print(f"Ya existe un usuario con el login '{usuario}'.")
            return

        nuevo = Usuario(
            nombre_completo=nombre_completo,
            registro_medico=registro_medico,
            especialidad=especialidad,
            usuario=usuario,
            password_hash=hash_password(password),
        )
        db.add(nuevo)
        db.commit()
        db.refresh(nuevo)
        print(f"Medico creado con id={nuevo.id}, usuario='{nuevo.usuario}'")
    finally:
        db.close()


if __name__ == "__main__":
    main()
