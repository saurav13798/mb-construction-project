@echo off
title MB Construction - Application Launcher
color 0A

echo.
echo ==============================================================
echo                MB Construction Application                   
echo                    Quick Launcher                            
echo ==============================================================
echo.

REM Check for command line arguments
set "COMMAND=%1"
if "%COMMAND%"=="" goto :show_menu

REM Handle command line arguments
if "%COMMAND%"=="full" goto :start_full
if "%COMMAND%"=="backend" goto :start_backend
if "%COMMAND%"=="frontend" goto :start_frontend
if "%COMMAND%"=="help" goto :show_help

REM Default - show menu
:show_menu
echo Please select an option:
echo.
echo [1] Start Full Application (Frontend + Backend)
echo [2] Start Backend Only
echo [3] Start Frontend Only
echo [4] Help and Information
echo [5] Exit
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto :start_full
if "%choice%"=="2" goto :start_backend
if "%choice%"=="3" goto :start_frontend
if "%choice%"=="4" goto :show_help
if "%choice%"=="5" goto :exit
goto :show_menu

REM ========================================
REM   START FULL APPLICATION
REM ========================================
:start_full
echo.
echo ==============================================================
echo                  STARTING FULL APPLICATION                  
echo ==============================================================

echo.
echo Cleaning up ports...
npx kill-port 3000 >nul 2>&1
npx kill-port 8080 >nul 2>&1

echo Starting backend server...
start "MB Construction Backend" cmd /k "cd /d "%~dp0backend" && npm start"

echo Waiting for backend to initialize...
timeout /t 3 /nobreak >nul

echo Starting frontend server...
start "MB Construction Frontend" cmd /k "cd /d "%~dp0frontend" && npm start"

echo.
echo ✅ Both servers are starting in separate windows
echo.
echo 🌐 Application URLs:
echo    • Frontend: http://localhost:8080
echo    • Backend API: http://localhost:3000
echo    • Health Check: http://localhost:3000/health
echo.
set /p OPENURL="Open URLs in browser now? (Y/N): "
if /i "%OPENURL%"=="Y" (
    start "" http://localhost:8080
    start "" http://localhost:3000/health
)
echo.
pause
goto :exit

REM ========================================
REM   START BACKEND ONLY
REM ========================================
:start_backend
echo.
echo ==============================================================
echo                    STARTING BACKEND ONLY                    
echo ==============================================================

echo.
echo Cleaning up port 3000...
npx kill-port 3000 >nul 2>&1

echo Starting backend server...
echo.
echo 🌐 Backend will be available at: http://localhost:3000
echo 🔍 Health check: http://localhost:3000/health
echo.
cd /d "%~dp0backend"
npm start
goto :exit

REM ========================================
REM   START FRONTEND ONLY
REM ========================================
:start_frontend
echo.
echo ==============================================================
echo                   STARTING FRONTEND ONLY                    
echo ==============================================================

echo.
echo Cleaning up port 8080...
npx kill-port 8080 >nul 2>&1

echo Starting frontend server...
echo.
echo 🌐 Frontend will be available at: http://localhost:8080
echo.
cd /d "%~dp0frontend"
npm start
goto :exit

REM ========================================
REM   HELP INFORMATION
REM ========================================
:show_help
echo.
echo ==============================================================
echo                         HELP GUIDE                          
echo ==============================================================
echo.
echo MB Construction Application Launcher - Help Guide
echo.
echo 📋 COMMAND LINE USAGE:
echo    start.bat [command]
echo.
echo 🎯 AVAILABLE COMMANDS:
echo    full      - Start both frontend and backend servers
echo    backend   - Start backend server only
echo    frontend  - Start frontend server only
echo    help      - Show this help guide
echo.
echo 🌐 APPLICATION URLS:
echo    • Frontend: http://localhost:8080
echo    • Backend API: http://localhost:3000
echo    • Health Check: http://localhost:3000/health
echo.
echo 💡 MANUAL STARTUP:
echo    Backend: cd backend && npm start
echo    Frontend: cd frontend && npm start
echo.
pause
goto :show_menu

REM ========================================
REM   EXIT
REM ========================================
:exit
echo.
echo Thank you for using MB Construction Application Launcher!
echo.
exit /b 0