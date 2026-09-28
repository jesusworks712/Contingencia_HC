@echo off
setlocal

REM ============================================================
REM  Sistema de Contingencia - Historias Clinicas
REM  MODO PRODUCCION: un solo servidor, sin --reload, con workers
REM  URL para los medicos: http://10.50.0.95:5173/login
REM ============================================================

set "RAIZ=%~dp0"
set "VENV_ACTIVATE=%RAIZ%venv\Scripts\activate.bat"
set "PUERTO=5173"
set "WORKERS=4"

echo ============================================================
echo   Iniciando Sistema de Contingencia (MODO PRODUCCION)
echo ============================================================
echo.

if not exist "%VENV_ACTIVATE%" (
    echo [ERROR] No se encontro el entorno virtual.
    pause
    exit /b 1
)

REM --- Detectar la IP local ---
set "IP_LOCAL=localhost"
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /c:"IPv4"') do (
    set "IP_LOCAL=%%A"
    goto :ip_encontrada
)
:ip_encontrada
set "IP_LOCAL=%IP_LOCAL: =%"

echo IP detectada: %IP_LOCAL%
echo.

REM --- Compilar el frontend (produce frontend/dist) ---
echo Compilando frontend...
cd /d "%RAIZ%frontend"
call npm run build
if errorlevel 1 (
    echo [ERROR] Fallo la compilacion del frontend. Revisa los errores arriba.
    pause
    exit /b 1
)
cd /d "%RAIZ%"

REM --- Levantar el backend, sirviendo tambien el frontend compilado ---
echo.
echo Iniciando servidor en http://%IP_LOCAL%:%PUERTO% con %WORKERS% workers...
call "%VENV_ACTIVATE%"
uvicorn app.main:app --host 0.0.0.0 --port %PUERTO% --workers %WORKERS%

endlocal