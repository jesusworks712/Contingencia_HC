@echo off
REM =====================================================================
REM Iniciar Sistema de Contingencia - Historias Clinicas
REM Modo: Red Local HTTPS (un solo servidor, los medicos entran por navegador)
REM Colocar en la carpeta raiz del backend (contingencia_backend)
REM =====================================================================

title Sistema de Contingencia - Historias Clinicas
color 0B

echo ============================================
echo  Sistema de Contingencia - Historias Clinicas
echo ============================================
echo.

REM --- Verificar que el entorno virtual exista ---
if not exist "venv\Scripts\activate.bat" (
    echo [ERROR] No se encontro el entorno virtual en venv\
    echo Crea el entorno con: python -m venv venv
    pause
    exit /b
)
call venv\Scripts\activate.bat

REM --- Verificar que el frontend este compilado ---
if not exist "frontend\dist\index.html" (
    echo [ERROR] El frontend no esta compilado.
    echo Ejecuta esto primero:
    echo    cd frontend
    echo    npm run build
    echo.
    pause
    exit /b
)

REM --- Verificar certificados SSL ---
if not exist "key.pem" (
    echo [ERROR] No se encontro key.pem
    echo Genera el certificado con: python generar_certificado.py
    pause
    exit /b
)
if not exist "cert.pem" (
    echo [ERROR] No se encontro cert.pem
    echo Genera el certificado con: python generar_certificado.py
    pause
    exit /b
)

REM --- Mostrar IPs disponibles ---
echo Direcciones IP de este equipo (los medicos deben usar una de estas):
echo.
ipconfig | findstr /R /C:"IPv4"
echo.

echo Iniciando servidor HTTPS en el puerto 8000...
echo.
echo   Los medicos deben entrar a:
echo   https://[IP-DE-ESTE-EQUIPO]:8000
echo.
echo   (el navegador mostrara advertencia de "sitio no seguro" por ser
echo    certificado autofirmado - deben dar clic en Avanzado - Continuar)
echo.
echo (Presiona Ctrl+C para detener el servidor)
echo ============================================
echo.

uvicorn app.main:app --host 0.0.0.0 --port 8000 --ssl-keyfile key.pem --ssl-certfile cert.pem

echo.
echo Servidor detenido.
pause