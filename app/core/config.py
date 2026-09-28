"""
Configuracion central del proyecto.
Lee las variables desde el archivo .env (ver .env.example).
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- Base de datos ---
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/contingencia_historias"

    # --- JWT ---
    SECRET_KEY: str = "CAMBIA_ESTO_POR_UNA_CLAVE_SEGURA_EN_PRODUCCION"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8  # 8 horas de sesion

    # --- App ---
    APP_NAME: str = "Sistema de Contingencia - Historias Clinicas"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()