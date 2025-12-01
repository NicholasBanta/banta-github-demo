@echo off
REM Start Voter Registration API with HTTPS
REM This script sets up environment variables and starts the server with HTTPS enabled

setlocal enabledelayedexpansion

set HTTPS=true
set SSL_KEY_PATH=certs/server.key
set SSL_CERT_PATH=certs/server.crt

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   Voter Registration API - HTTPS Server Starter             ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if certs exist
if not exist "%SSL_KEY_PATH%" (
    echo [!] Certificate files not found in %SSL_KEY_PATH%
    echo.
    echo Run the generator first:
    echo   node scripts/generate_self_signed.js
    echo.
    pause
    exit /b 1
)

echo [✓] HTTPS enabled
echo [✓] Key: %SSL_KEY_PATH%
echo [✓] Cert: %SSL_CERT_PATH%
echo.
echo Starting server...
echo.

node server.js

pause
