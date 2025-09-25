@echo off
title MB Construction - Quick Start
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║              MB Construction - Quick Start                   ║
echo ║                  Fast Development Launch                     ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Quick system check
echo 🔍 Quick system check...
if not exist "backend\.env" (
    echo ❌ Project not set up! Please run setup.bat first.
    pause
    exit /b 1
)

REM Check MongoDB
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%" neq "0" (
    echo 🔄 Starting MongoDB...
    net start MongoDB >nul 2>&1 || start "MongoDB" /MIN mongod --dbpath "C:\data\db"
    timeout /t 2 /nobreak >nul
)

echo 🚀 Quick starting MB Construction...
echo.
echo 📱 Starting Backend Server...
start "MB Construction Backend" cmd /k "cd /d "%~dp0backend" && echo Backend starting... && npm run dev"

echo ⏳ Waiting for backend to initialize...
timeout /t 3 /nobreak >nul

echo 🎨 Starting Frontend Server...
start "MB Construction Frontend" cmd /k "cd /d "%~dp0frontend" && echo Frontend starting... && npm start"

echo.
echo ✅ Both servers are starting in separate windows!
echo.
echo 🌐 Application URLs:
echo    • Frontend: http://localhost:8080
echo    • Backend API: http://localhost:3000
echo    • Health Check: http://localhost:3000/health
echo.
echo 💡 Pro Tips:
echo    • Both servers will auto-reload on file changes
echo    • Close server windows when done developing
echo    • Use Ctrl+C in server windows to stop gracefully
echo.
echo 📋 Server Windows Opened:
echo    • Backend: Development server with hot reload
echo    • Frontend: Live development server
echo.

REM Wait a bit then try to open browser
timeout /t 5 /nobreak >nul
echo 🌐 Opening browser...
start http://localhost:8080

echo.
echo 🎉 Quick start complete! Happy coding!
pause