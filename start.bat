@echo off
setlocal enabledelayedexpansion
title MB Construction - Professional Launcher

:: ============================================================================
:: MB Construction Professional Launcher
:: Enhanced startup script with comprehensive features and error handling
:: ============================================================================

:: Set colors for professional presentation
set "GREEN=[92m"
set "BLUE=[94m"
set "YELLOW=[93m"
set "RED=[91m"
set "CYAN=[96m"
set "MAGENTA=[95m"
set "WHITE=[97m"
set "BOLD=[1m"
set "RESET=[0m"

:: Clear screen and display professional header
cls
echo.
echo %CYAN%%BOLD%================================================================================
echo                          🏗️ MB Construction
echo                        Professional Website Launcher
echo                          Building Tomorrow, Today
echo ================================================================================%RESET%
echo.

:: Display current date and time
echo %WHITE%🕒 Launch Time: %DATE% %TIME%%RESET%
echo %WHITE%📁 Working Directory: %CD%%RESET%
echo.

:: System Requirements Check
echo %BLUE%%BOLD%🔍 System Requirements Check%RESET%
echo %CYAN%────────────────────────────────────────────────────────────────────────────────%RESET%

:: Check Node.js
where node >nul 2>&1
if %errorLevel% == 0 (
    for /f "tokens=*" %%i in ('node --version') do set nodeVersion=%%i
    echo %GREEN%✓ Node.js: !nodeVersion!%RESET%
) else (
    echo %RED%❌ Node.js: Not installed%RESET%
    echo %WHITE%   Please install Node.js from https://nodejs.org/%RESET%
    goto :error_exit
)

:: Check npm
where npm >nul 2>&1
if %errorLevel% == 0 (
    for /f "tokens=*" %%i in ('npm --version') do set npmVersion=%%i
    echo %GREEN%✓ npm: v!npmVersion!%RESET%
) else (
    echo %RED%❌ npm: Not installed%RESET%
    goto :error_exit
)

:: Check MongoDB
where mongod >nul 2>&1
if %errorLevel% == 0 (
    echo %GREEN%✓ MongoDB: Available%RESET%
) else (
    echo %YELLOW%⚠ MongoDB: Not in PATH (may still be installed)%RESET%
)

:: Check Git (optional)
where git >nul 2>&1
if %errorLevel% == 0 (
    echo %GREEN%✓ Git: Available%RESET%
) else (
    echo %YELLOW%⚠ Git: Not available%RESET%
)

echo.

:: Project Structure Validation
echo %BLUE%%BOLD%📋 Project Structure Validation%RESET%
echo %CYAN%────────────────────────────────────────────────────────────────────────────────%RESET%

if exist "package.json" (
    echo %GREEN%✓ Root package.json found%RESET%
) else (
    echo %RED%❌ Root package.json missing%RESET%
    goto :error_exit
)

if exist "backend" (
    echo %GREEN%✓ Backend directory found%RESET%
    if exist "backend\package.json" (
        echo %GREEN%✓ Backend package.json found%RESET%
    ) else (
        echo %YELLOW%⚠ Backend package.json missing%RESET%
    )
    if exist "backend\server.js" (
        echo %GREEN%✓ Backend server.js found%RESET%
    ) else (
        echo %RED%❌ Backend server.js missing%RESET%
        goto :error_exit
    )
) else (
    echo %RED%❌ Backend directory missing%RESET%
    goto :error_exit
)

if exist "frontend" (
    echo %GREEN%✓ Frontend directory found%RESET%
    if exist "frontend\public" (
        echo %GREEN%✓ Frontend public directory found%RESET%
    ) else (
        echo %YELLOW%⚠ Frontend public directory missing%RESET%
    )
) else (
    echo %RED%❌ Frontend directory missing%RESET%
    goto :error_exit
)

echo.

:: Dependencies Check
echo %BLUE%%BOLD%📦 Dependencies Check%RESET%
echo %CYAN%────────────────────────────────────────────────────────────────────────────────%RESET%

set needsInstall=0

if not exist "node_modules" (
    echo %YELLOW%⚠ Root dependencies not installed%RESET%
    set needsInstall=1
) else (
    echo %GREEN%✓ Root dependencies installed%RESET%
)

if not exist "backend\node_modules" (
    echo %YELLOW%⚠ Backend dependencies not installed%RESET%
    set needsInstall=1
) else (
    echo %GREEN%✓ Backend dependencies installed%RESET%
)

if %needsInstall% == 1 (
    echo.
    echo %YELLOW%📦 Installing missing dependencies...%RESET%
    
    if not exist "node_modules" (
        echo %WHITE%Installing root dependencies...%RESET%
        call npm install --silent
        if !errorLevel! neq 0 (
            echo %RED%❌ Failed to install root dependencies%RESET%
            goto :error_exit
        )
        echo %GREEN%✓ Root dependencies installed%RESET%
    )
    
    if not exist "backend\node_modules" (
        echo %WHITE%Installing backend dependencies...%RESET%
        cd backend
        call npm install --silent
        if !errorLevel! neq 0 (
            echo %RED%❌ Failed to install backend dependencies%RESET%
            cd ..
            goto :error_exit
        )
        cd ..
        echo %GREEN%✓ Backend dependencies installed%RESET%
    )
)

echo.

:: MongoDB Connection Check
echo %BLUE%%BOLD%🗄️ Database Connection Check%RESET%
echo %CYAN%────────────────────────────────────────────────────────────────────────────────%RESET%

:: Try to start MongoDB service if not running
sc query MongoDB 2>nul | find "RUNNING" >nul
if %errorLevel% neq 0 (
    echo %YELLOW%⚠ MongoDB service not running, attempting to start...%RESET%
    net start MongoDB 2>nul
    if !errorLevel! == 0 (
        echo %GREEN%✓ MongoDB service started%RESET%
        timeout /t 2 /nobreak >nul
    ) else (
        echo %YELLOW%⚠ Could not start MongoDB service%RESET%
    )
)

:: Test database connection
cd backend
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://localhost:27017/mb_construction', {serverSelectionTimeoutMS: 3000}).then(() => { console.log('✓ Database connection successful'); mongoose.disconnect(); process.exit(0); }).catch(err => { console.log('❌ Database connection failed'); process.exit(1); });" 2>nul
set dbStatus=!errorLevel!
cd ..

if %dbStatus% == 0 (
    echo %GREEN%✓ MongoDB connection successful%RESET%
) else (
    echo %YELLOW%⚠ MongoDB connection failed - application will show connection errors%RESET%
    echo %WHITE%  Make sure MongoDB is installed and running%RESET%
)

echo.

:: Create necessary directories
if not exist "backend\logs" (
    mkdir "backend\logs"
    echo %GREEN%✓ Created logs directory%RESET%
)

if not exist "backend\uploads" (
    mkdir "backend\uploads"
    echo %GREEN%✓ Created uploads directory%RESET%
)

:: Launch Options
echo %MAGENTA%%BOLD%🚀 Launch Options%RESET%
echo %CYAN%────────────────────────────────────────────────────────────────────────────────%RESET%
echo %WHITE%   [1] 🌐 Start Full Application (Recommended)%RESET%
echo %WHITE%   [2] 🔧 Start Backend Only%RESET%
echo %WHITE%   [3] 💻 Start Frontend Only%RESET%
echo %WHITE%   [4] 🗄️ Database Management%RESET%
echo %WHITE%   [5] 🛠️ Developer Tools%RESET%
echo %WHITE%   [6] 📊 System Status%RESET%
echo %WHITE%   [7] ❌ Exit%RESET%
echo.

set /p choice=%CYAN%Enter your choice (1-7): %RESET%

if "%choice%"=="1" goto :start_full
if "%choice%"=="2" goto :start_backend
if "%choice%"=="3" goto :start_frontend
if "%choice%"=="4" goto :database_management
if "%choice%"=="5" goto :developer_tools
if "%choice%"=="6" goto :system_status
if "%choice%"=="7" goto :normal_exit
goto :invalid_choice

:start_full
echo.
echo %GREEN%%BOLD%🚀 Starting MB Construction Full Application%RESET%
echo %CYAN%────────────────────────────────────────────────────────────────────────────────%RESET%
echo.
echo %BLUE%📊 Application URLs:%RESET%
echo %WHITE%   🌐 Main Website: http://localhost:8080%RESET%
echo %WHITE%   🔧 Admin Dashboard: http://localhost:8080/admin.html%RESET%
echo %WHITE%   📡 API Server: http://localhost:3000%RESET%
echo %WHITE%   📡 API Health Check: http://localhost:3000/health%RESET%
echo %WHITE%   📋 API Documentation: http://localhost:3000/api%RESET%
echo.
echo %YELLOW%💡 Tips:%RESET%
echo %WHITE%   • Press Ctrl+C in any terminal to stop that service%RESET%
echo %WHITE%   • Check terminal windows for detailed logs and errors%RESET%
echo %WHITE%   • Use the admin dashboard to manage inquiries and analytics%RESET%
echo.
echo %GREEN%Starting services...%RESET%

:: Start backend in new window
start "🔧 MB Construction Backend" cmd /k "title MB Construction Backend && cd /d %CD%\backend && echo Starting Backend Server... && echo. && npm run dev"

:: Wait a moment for backend to start
timeout /t 3 /nobreak >nul

:: Start frontend in new window (if it exists and has a start script)
if exist "frontend\package.json" (
    start "💻 MB Construction Frontend" cmd /k "title MB Construction Frontend && cd /d %CD%\frontend && echo Starting Frontend Server on port 8080... && echo. && npm run dev"
) else (
    echo %YELLOW%⚠ Frontend package.json not found, serving static files through backend%RESET%
)

echo.
echo %GREEN%✅ Application started successfully!%RESET%
echo %WHITE%Check the opened terminal windows for detailed logs%RESET%
echo.
echo %CYAN%Press any key to return to menu...%RESET%
pause >nul
goto :menu

:start_backend
echo.
echo %GREEN%🔧 Starting Backend Server Only%RESET%
echo.
cd backend
call npm run dev
cd ..
goto :menu

:start_frontend
echo.
echo %GREEN%💻 Starting Frontend Only%RESET%
echo %WHITE%Note: Backend must be running separately for full functionality%RESET%
echo.
if exist "frontend\package.json" (
    cd frontend
    call npm run dev
    cd ..
) else (
    echo %YELLOW%Frontend package.json not found%RESET%
    echo %WHITE%Static files are served through the backend server%RESET%
    pause
)
goto :menu

:database_management
echo.
call dev-tools.bat
goto :menu

:developer_tools
echo.
call dev-tools.bat
goto :menu

:system_status
echo.
echo %BLUE%%BOLD%📊 System Status%RESET%
echo %CYAN%────────────────────────────────────────────────────────────────────────────────%RESET%

:: Show running Node.js processes
echo %WHITE%Node.js Processes:%RESET%
tasklist /fi "imagename eq node.exe" /fo table 2>nul | find "node.exe"
if %errorLevel% neq 0 echo %YELLOW%No Node.js processes running%RESET%

echo.
echo %WHITE%Port Usage:%RESET%
netstat -an | find ":3000"
if %errorLevel% neq 0 echo %YELLOW%Port 3000 is available (backend)%RESET%
netstat -an | find ":8080"
if %errorLevel% neq 0 echo %YELLOW%Port 8080 is available (frontend)%RESET%

echo.
echo %WHITE%MongoDB Service Status:%RESET%
sc query MongoDB 2>nul | find "STATE"

echo.
echo %WHITE%Application Health:%RESET%
curl -s http://localhost:3000/health 2>nul || echo %YELLOW%Application not responding%RESET%

echo.
pause
goto :menu

:invalid_choice
echo.
echo %RED%❌ Invalid choice. Please select 1-7.%RESET%
timeout /t 2 /nobreak >nul
goto :menu

:menu
cls
echo.
echo %CYAN%%BOLD%================================================================================
echo                          🏗️ MB Construction
echo                        Professional Website Launcher
echo                          Building Tomorrow, Today
echo ================================================================================%RESET%
echo.
goto :show_menu

:show_menu
echo %MAGENTA%%BOLD%🚀 Launch Options%RESET%
echo %CYAN%────────────────────────────────────────────────────────────────────────────────%RESET%
echo %WHITE%   [1] 🌐 Start Full Application (Recommended)%RESET%
echo %WHITE%   [2] 🔧 Start Backend Only%RESET%
echo %WHITE%   [3] 💻 Start Frontend Only%RESET%
echo %WHITE%   [4] 🗄️ Database Management%RESET%
echo %WHITE%   [5] 🛠️ Developer Tools%RESET%
echo %WHITE%   [6] 📊 System Status%RESET%
echo %WHITE%   [7] ❌ Exit%RESET%
echo.

set /p choice=%CYAN%Enter your choice (1-7): %RESET%

if "%choice%"=="1" goto :start_full
if "%choice%"=="2" goto :start_backend
if "%choice%"=="3" goto :start_frontend
if "%choice%"=="4" goto :database_management
if "%choice%"=="5" goto :developer_tools
if "%choice%"=="6" goto :system_status
if "%choice%"=="7" goto :normal_exit
goto :invalid_choice

:error_exit
echo.
echo %RED%%BOLD%❌ Setup Error%RESET%
echo %WHITE%Please resolve the above issues and try again.%RESET%
echo.
pause
exit /b 1

:normal_exit
echo.
echo %GREEN%%BOLD%✅ Thank you for using MB Construction!%RESET%
echo %WHITE%🏗️ Building Tomorrow, Today%RESET%
echo.
echo %CYAN%Visit us at: https://mbconstruction.com%RESET%
echo.
timeout /t 3 /nobreak >nul
exit /b 0