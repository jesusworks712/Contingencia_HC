# Sistema de Contingencia - Historias Clinicas (Backend - Fase 1)

Backend base: FastAPI + PostgreSQL + login JWT.

## 1. Instalar dependencias

```bash
python -m venv venv
source venv/bin/activate   # en Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 2. Configurar la conexion a la base de datos

```bash
cp .env.example .env
```

Edita `.env` y pon la URL real de tu base `contingencia_historias`
(usuario, contraseña, host y puerto de tu PostgreSQL).

## 3. Crear un medico de prueba

El script SQL original insertaba un usuario con un hash de ejemplo que
**no sirve** para hacer login real. Usa este script en su lugar:

```bash
python crear_medico.py
```

Te va a pedir nombre, registro medico, usuario y contraseña, y crea el
registro con el hash bcrypt correcto.

## 4. Levantar el servidor

```bash
uvicorn app.main:app --reload
```

Abre `http://localhost:8000/docs` para ver Swagger.

## 5. Probar el flujo

1. `POST /auth/login` con el usuario/contraseña que creaste -> te
   devuelve un `access_token`.
2. En Swagger, boton "Authorize" (candado arriba a la derecha) -> pega
   el token.
3. `GET /auth/yo` -> si el token es valido, te devuelve los datos del
   medico logueado. Esto confirma que el login y la proteccion de
   endpoints funcionan.

## Estructura del proyecto

```
app/
  core/       -> configuracion, seguridad (JWT, hash), dependencias
  db/         -> conexion a PostgreSQL (SQLAlchemy)
  models/     -> tablas usuarios e historias_clinicas (ya las creaste en SQL)
  schemas/    -> validacion de datos con Pydantic
  routers/    -> endpoints (por ahora solo auth.py)
  main.py     -> arranque de la app
crear_medico.py -> script para crear medicos con password real
```

## Siguiente paso (Fase 2)

Con el login funcionando, seguimos con el CRUD de `historias_clinicas`:
crear, actualizar por modulo, buscar por cedula/nombre y finalizar.
