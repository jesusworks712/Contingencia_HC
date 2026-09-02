"""
Punto de entrada de la aplicacion.

En desarrollo: ejecutar con `uvicorn app.main:app --reload`
  (el frontend corre aparte con `npm run dev` en el puerto 5173)

En produccion / red local: ejecutar con
  `uvicorn app.main:app --host 0.0.0.0 --port 8000`
  (el frontend debe estar compilado con `npm run build` dentro de
  la carpeta frontend/dist, y este mismo servidor lo sirve tambien,
  para que los medicos solo necesiten entrar a http://IP-DEL-SERVIDOR:8000)
"""
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.core.config import settings
from app.routers import auth, historias

app = FastAPI(title=settings.APP_NAME)

# CORS abierto (en red local cerrada esto no representa un riesgo real,
# ya que no hay exposicion a internet).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(historias.router)


@app.get("/api/health")
def health_check():
    """Endpoint simple para confirmar que el servidor esta vivo."""
    return {"status": "ok", "app": settings.APP_NAME}


# ---------------------------------------------------------------------
# Servir el frontend compilado (React), si existe.
# Se genera con: cd frontend && npm run build  ->  frontend/dist
# ---------------------------------------------------------------------
FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"

if FRONTEND_DIST.exists():
    # Archivos estaticos (JS, CSS, imagenes) generados por Vite
    app.mount(
        "/assets",
        StaticFiles(directory=FRONTEND_DIST / "assets"),
        name="frontend-assets",
    )

    @app.get("/{ruta_completa:path}")
    def servir_frontend(ruta_completa: str):
        """
        Si la ruta corresponde a un archivo real dentro de dist (por
        ejemplo un PDF publico como formula-medica-manual.pdf), se sirve
        ese archivo. Si no, se asume que es una ruta de React Router
        (BrowserRouter) y se devuelve index.html.
        """
        archivo_solicitado = FRONTEND_DIST / ruta_completa
        if archivo_solicitado.is_file():
            return FileResponse(archivo_solicitado)

        archivo_index = FRONTEND_DIST / "index.html"
        return FileResponse(archivo_index)
