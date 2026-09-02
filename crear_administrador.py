"""
Generador de INSERT para crear TU usuario como el primer medico
(administrador) del sistema.
-----------------------------------------------
Uso:
    1. Edita los datos abajo con tus datos reales
    2. python crear_administrador.py
    3. Copia el INSERT que te imprime y pegalo en pgAdmin
       (conectado a la base contingencia_historias)

Ejecutar esto DESPUES de haber corrido limpiar_base_datos.sql
"""

import bcrypt


# =====================================================================
# TUS DATOS - edita esto con tu informacion real
# =====================================================================
nombre_completo = "Ovidio Castro"
registro_medico = "RM-000000"
especialidad = "MEDICINA FISICA Y REHABILITACION"
usuario = "admin"
password_en_claro = "123456"


# =====================================================================
# Generacion del hash bcrypt (no toques esto)
# =====================================================================
salt = bcrypt.gensalt(rounds=12)
password_hash = bcrypt.hashpw(password_en_claro.encode("utf-8"), salt).decode("utf-8")

insert_sql = f"""
INSERT INTO usuarios (nombre_completo, registro_medico, especialidad, usuario, password_hash)
VALUES (
    '{nombre_completo}',
    '{registro_medico}',
    '{especialidad}',
    '{usuario}',
    '{password_hash}'
);
"""

print("=" * 70)
print(f"Usuario:    {usuario}")
print(f"Contraseña: {password_en_claro}   <-- guardala, esta es la que usaras para iniciar sesion")
print("=" * 70)
print("\nCopia y pega este INSERT en pgAdmin (Query Tool):\n")
print(insert_sql)