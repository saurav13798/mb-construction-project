@echo off
title MB Construction - Quick Start

:: Quick Start Script for MB Construction Project
:: This script starts the application with minimal setup

echo.
echo ==========================================
echo    MB Construction - Quick Start
echo    Building Tomorrow, Today
echo ==========================================
echo.

:: Check if Node.js is installed
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

:: Check if we're in the right directory
if not exist "package.json" (
    echo ❌ package.json not found. Please run from project root.
    pause
    exit /b 1
)

echo ✓ Node.js found
echo ✓ Project structure validated
echo.

:: Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
)

if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

echo.
echo 🚀 Starting MB Construction Application...
echo.
echo 📊 Application will be available at:
echo    🌐 Website: http://localhost:8080
echo    🔧 Admin: http://localhost:8080/admin.html
echo    📡 API: http://localhost:3000
echo.
echo Press Ctrl+C to stop the application
echo.

:: Start the application (both backend and frontend)
call npm run start

pause