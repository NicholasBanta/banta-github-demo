@echo off
REM Setup Verification Script for Voter Registration System (Windows)
REM This script verifies all components are properly installed

setlocal enabledelayedexpansion

echo =========================================
echo Voter Registration System - Setup Check
echo =========================================
echo.

REM Check Node.js
echo Checking Node.js...
where node >nul 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo   [OK] Node.js installed: !NODE_VERSION!
) else (
    echo   [ERROR] Node.js NOT found. Please install from https://nodejs.org/
    exit /b 1
)

REM Check npm
echo.
echo Checking npm...
where npm >nul 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo   [OK] npm installed: !NPM_VERSION!
) else (
    echo   [ERROR] npm NOT found
    exit /b 1
)

REM Check package.json
echo.
echo Checking project files...
if exist "package.json" (
    echo   [OK] package.json found
) else (
    echo   [ERROR] package.json NOT found
    exit /b 1
)

REM Check node_modules
if exist "node_modules" (
    echo   [OK] node_modules found (dependencies installed)
) else (
    echo   [WARNING] node_modules NOT found. Run 'npm install' first
)

REM Check required files
echo.
echo Checking required documentation files...
set FILES=server.js registration.html package.json API_README.md QUICKSTART.md API_TESTING.md BACKEND_SUMMARY.md

for %%F in (%FILES%) do (
    if exist "%%F" (
        echo   [OK] %%F
    ) else (
        echo   [ERROR] %%F NOT found
    )
)

REM Check npm packages
echo.
echo Checking required npm packages...
set PACKAGES=express cors body-parser

for %%P in (%PACKAGES%) do (
    if exist "node_modules\%%P" (
        echo   [OK] %%P
    ) else (
        echo   [WARNING] %%P not installed
    )
)

REM Check .env
echo.
echo Checking environment configuration...
if exist ".env" (
    echo   [OK] .env file found
) else (
    if exist ".env.example" (
        echo   [WARNING] .env file not found (using defaults)
        echo            Copy .env.example to .env and customize if needed
    ) else (
        echo   [ERROR] .env.example not found
    )
)

REM Summary
echo.
echo =========================================
echo Setup Verification Complete!
echo =========================================
echo.
echo Next steps:
echo 1. If dependencies missing:             npm install
echo 2. Start the backend:                   npm run dev
echo 3. Open frontend in browser:            registration.html
echo 4. For testing guide, see:              QUICKSTART.md
echo.
pause
