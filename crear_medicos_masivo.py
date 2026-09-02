"""
Crea VARIOS medicos al mismo tiempo desde una lista, generando un
solo archivo SQL con todos los INSERT listos para pegar en pgAdmin.

Uso:
    1. Edita la lista MEDICOS abajo con todos los que necesites
    2. python crear_medicos_masivo.py
    3. Se genera el archivo medicos_generados.sql
    4. Abre pgAdmin (conectado a contingencia_historias) y ejecuta
       ese archivo completo
"""

import bcrypt


# =====================================================================
# LISTA DE MEDICOS - agrega uno por linea, cuantos necesites
# =====================================================================
MEDICOS = [
    {"nombre": "Juan Perez",      "registro": "RM-111111", "especialidad": "MEDICINA FISICA Y REHABILITACION", "usuario": "jperez",  "password": "clave123"},
    {"nombre": "Laura Morales",   "registro": "RM-222222", "especialidad": "MEDICINA FISICA Y REHABILITACION", "usuario": "lmorales", "password": "clave123"},
    {"nombre": "Carlos Ramirez",  "registro": "RM-333333", "especialidad": "MEDICINA FISICA Y REHABILITACION", "usuario": "cramirez", "password": "clave123"},
    # agrega mas medicos aqui, con el mismo formato...
]


# =====================================================================
# Generacion del SQL (no toques esto)
# =====================================================================
lineas_sql = []
resumen = []

for m in MEDICOS:
    salt = bcrypt.gensalt(rounds=12)
    hash_pw = bcrypt.hashpw(m["password"].encode("utf-8"), salt).decode("utf-8")

    lineas_sql.append(f"""INSERT INTO usuarios (nombre_completo, registro_medico, especialidad, usuario, password_hash, es_admin)
VALUES ('{m["nombre"]}', '{m["registro"]}', '{m["especialidad"]}', '{m["usuario"]}', '{hash_pw}', FALSE);""")

    resumen.append(f"  {m['usuario']:15s} | contraseña: {m['password']}")

sql_final = "\n\n".join(lineas_sql) + "\n\n-- Verificacion\nSELECT id, nombre_completo, usuario FROM usuarios ORDER BY id;\n"

with open("medicos_generados.sql", "w", encoding="utf-8") as f:
    f.write(sql_final)

print("=" * 70)
print(f"Se generaron {len(MEDICOS)} medicos en: medicos_generados.sql")
print("=" * 70)
print("\nCredenciales (guardalas para entregarselas a cada medico):\n")
for linea in resumen:
    print(linea)
print("\nAhora abre pgAdmin y ejecuta el archivo medicos_generados.sql")
