@echo off
setlocal enabledelayedexpansion

:: ============================================================================
:: MB Construction Project Launcher
:: Professional batch script to start the complete MB Construction website
:: ============================================================================

title MB Construction - Project Launcher

:: Set colors for better visual presentation
set "GREEN=[92m"
set "BLUE=[94m"
set "YELLOW=[93m"
set "RED=[91m"
set "CYAN=[96m"
set "MAGENTA=[95m"
set "WHITE=[97m"
set "RESET=[0m"

:: Clear screen and show header
cls
echo.
echo %CYAN%================================================================================
echo                        MB Construction Project Launcher
echo                           Building Tomorrow, Today
echo ================================================================================%RESET%
echo.

:: Check if running as administrator (optional but recommended)
net session >nul 2>&1
if %errorLevel% == 0 (
    echo %GREEN%✓ Running with administrator privileges%RESET%
) else (
    echo %YELLOW%⚠ Running without administrator privileges (some features may be limited)%RESET%
)
echo.

:: Function to check if a command exists
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo %RED%❌ Node.js is not installed or not in PATH%RESET%
    echo %WHITE%Please install Node.js from https://nodejs.org/%RESET%
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorLevel% neq 0 (
    echo %RED%❌ npm is not installed or not in PATH%RESET%
    echo %WHITE%Please install npm (usually comes with Node.js)%RESET%
    pause
    exit /b 1
)

where mongod >nul 2>&1
if %errorLevel% neq 0 (
    echo %YELLOW%⚠ MongoDB is not installed or not in PATH%RESET%
    echo %WHITE%The application will try to connect to MongoDB on localhost:27017%RESET%
    echo %WHITE%Make sure MongoDB is running or install it from https://www.mongodb.com/%RESET%
    echo.
)

:: Display system information
echo %BLUE%📋 System Information:%RESET%
echo %WHITE%   Node.js Version: %RESET%
node --version
echo %WHITE%   npm Version: %RESET%
npm --version
echo %WHITE%   Current Directory: %CD%%RESET%
echo %WHITE%   Date/Time: %DATE% %TIME%%RESET%
echo.

:: Check if package.json exists
if not exist "package.json" (
    echo %RED%❌ package.json not found in current directory%RESET%
    echo %WHITE%Please run this script from the MB Construction project root directory%RESET%
    pause
    exit /b 1
)

:: Check if backend and frontend directories exist
if not exist "backend" (
    echo %RED%❌ Backend directory not found%RESET%
    pause
    exit /b 1
)

if not exist "frontend" (
    echo %RED%❌ Frontend directory not found%RESET%
    pause
    exit /b 1
)

echo %GREEN%✓ Project structure validated%RESET%
echo.

:: Check if dependencies are installed
echo %BLUE%🔍 Checking dependencies...%RESET%

if not exist "node_modules" (
    echo %YELLOW%⚠ Root dependencies not installed%RESET%
    echo %WHITE%Installing root dependencies...%RESET%
    call npm install
    if %errorLevel% neq 0 (
        echo %RED%❌ Failed to install root dependencies%RESET%
        pause
        exit /b 1
    )
    echo %GREEN%✓ Root dependencies installed%RESET%
) else (
    echo %GREEN%✓ Root dependencies found%RESET%
)

if not exist "backend\node_modules" (
    echo %YELLOW%⚠ Backend dependencies not installed%RESET%
    echo %WHITE%Installing backend dependencies...%RESET%
    cd backend
    call npm install
    if %errorLevel% neq 0 (
        echo %RED%❌ Failed to install backend dependencies%RESET%
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo %GREEN%✓ Backend dependencies installed%RESET%
) else (
    echo %GREEN%✓ Backend dependencies found%RESET%
)

echo.

:: Check MongoDB connection
echo %BLUE%🔌 Checking MongoDB connection...%RESET%
cd backend
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://localhost:27017/mb_construction', {serverSelectionTimeoutMS: 3000}).then(() => { console.log('✓ MongoDB connection successful'); mongoose.disconnect(); process.exit(0); }).catch(err => { console.log('❌ MongoDB connection failed:', err.message); process.exit(1); });" 2>nul
set mongoStatus=%errorLevel%
cd ..

if %mongoStatus% == 0 (
    echo %GREEN%✓ MongoDB is running and accessible%RESET%
) else (
    echo %YELLOW%⚠ MongoDB connection failed%RESET%
    echo %WHITE%Starting MongoDB service...%RESET%
    
    :: Try to start MongoDB service
    net start MongoDB 2>nul
    if %errorLevel% == 0 (
        echo %GREEN%✓ MongoDB service started%RESET%
        timeout /t 3 /nobreak >nul
    ) else (
        echo %YELLOW%⚠ Could not start MongoDB service automatically%RESET%
        echo %WHITE%Please ensure MongoDB is installed and running%RESET%
        echo %WHITE%You can start it manually or the application will show connection errors%RESET%
    )
)
echo.

:: Create logs directory if it doesn't exist
if not exist "backend\logs" (
    mkdir "backend\logs"
    echo %GREEN%✓ Created logs directory%RESET%
)

:: Show startup options
echo %MAGENTA%🚀 Startup Options:%RESET%
echo %WHITE%   [1] Start Full Application (Backend + Frontend)%RESET%
echo %WHITE%   [2] Start Backend Only%RESET%
echo %WHITE%   [3] Start Frontend Only%RESET%
echo %WHITE%   [4] Run Database Setup%RESET%
echo %WHITE%   [5] Check System Status%RESET%
echo %WHITE%   [6] View Recent Logs%RESET%
echo %WHITE%   [7] Exit%RESET%
echo.

set /p choice=%CYAN%Enter your choice (1-7): %RESET%

if "%choice%"=="1" goto :start_full
if "%choice%"=="2" goto :start_backend
if "%choice%"=="3" goto :start_frontend
if "%choice%"=="4" goto :setup_database
if "%choice%"=="5" goto :check_status
if "%choice%"=="6" goto :view_logs
if "%choice%"=="7" goto :exit
goto :invalid_choice

:start_full
echo.
echo %GREEN%🚀 Starting MB Construction Full Application...%RESET%
echo.
echo %BLUE%📊 Application URLs:%RESET%
echo %WHITE%   🌐 Website: http://localhost:8080%RESET%
echo %WHITE%   🔧 Admin Dashboard: http://localhost:8080/admin.html%RESET%
echo %WHITE%   📡 API Server: http://localhost:3000%RESET%
echo %WHITE%   📡 API Health: http://localhost:3000/health%RESET%
echo.
echo %YELLOW%Press Ctrl+C to stop the application%RESET%
echo.

:: Start both backend and frontend
start "MB Construction Backend" cmd /k "cd /d %CD%\backend && echo Starting Backend Server... && npm run dev"
timeout /t 3 /nobreak >nul
start "MB Construction Frontend" cmd /k "cd /d %CD%\frontend && echo Starting Frontend Server on port 8080... && npm run dev"

echo %GREEN%✓ Application started successfully!%RESET%
echo %WHITE%Check the opened terminal windows for detailed logs%RESET%
echo.
echo %CYAN%Press any key to return to menu or close this window to exit...%RESET%
pause >nul
goto :menu

:start_backend
echo.
echo %GREEN%🚀 Starting Backend Server Only...%RESET%
echo.
echo %BLUE%📊 Backend URLs:%RESET%
echo %WHITE%   📡 API Server: http://localhost:3000%RESET%
echo %WHITE%   🔧 Admin API: http://localhost:3000/api/admin%RESET%
echo %WHITE%   📡 Health Check: http://localhost:3000/health%RESET%
echo.

cd backend
call npm run dev
cd ..
goto :menu

:start_frontend
echo.
echo %GREEN%🚀 Starting Frontend Only...%RESET%
echo %WHITE%Note: Backend must be running separately for full functionality%RESET%
echo.

cd frontend
call npm start
cd ..
goto :menu

:setup_database
echo.
echo %BLUE%🗄️ Setting up Database...%RESET%
echo.

cd backend
echo %WHITE%Initializing database...%RESET%
call npm run db:init
if %errorLevel% neq 0 (
    echo %RED%❌ Database initialization failed%RESET%
    cd ..
    pause
    goto :menu
)

echo %WHITE%Seeding database with sample data...%RESET%
call npm run db:seed
if %errorLevel% neq 0 (
    echo %RED%❌ Database seeding failed%RESET%
    cd ..
    pause
    goto :menu
)

echo %GREEN%✓ Database setup completed successfully!%RESET%
cd ..
pause
goto :menu

:check_status
echo.
echo %BLUE%📊 System Status Check...%RESET%
echo.

:: Check if processes are running
echo %WHITE%Checking running processes...%RESET%
tasklist /fi "imagename eq node.exe" /fo table 2>nul | find "node.exe" >nul
if %errorLevel% == 0 (
    echo %GREEN%✓ Node.js processes are running%RESET%
) else (
    echo %YELLOW%⚠ No Node.js processes found%RESET%
)

:: Check ports
echo %WHITE%Checking port availability...%RESET%
netstat -an | find ":3000" >nul
if %errorLevel% == 0 (
    echo %GREEN%✓ Port 3000 is in use (backend API server)%RESET%
) else (
    echo %YELLOW%⚠ Port 3000 is available (backend not running)%RESET%
)

netstat -an | find ":8080" >nul
if %errorLevel% == 0 (
    echo %GREEN%✓ Port 8080 is in use (frontend server)%RESET%
) else (
    echo %YELLOW%⚠ Port 8080 is available (frontend not running)%RESET%
)

:: Check MongoDB
echo %WHITE%Checking MongoDB status...%RESET%
sc query MongoDB 2>nul | find "RUNNING" >nul
if %errorLevel% == 0 (
    echo %GREEN%✓ MongoDB service is running%RESET%
) else (
    echo %YELLOW%⚠ MongoDB service status unknown%RESET%
)

:: Check database connection and stats
if exist "backend\node_modules" (
    echo %WHITE%Checking database statistics...%RESET%
    cd backend
    call npm run db:stats 2>nul
    cd ..
)

echo.
pause
goto :menu

:view_logs
echo.
echo %BLUE%📋 Recent Application Logs...%RESET%
echo.

if exist "backend\logs\app.log" (
    echo %WHITE%Last 20 lines from application log:%RESET%
    echo %CYAN%----------------------------------------%RESET%
    powershell "Get-Content 'backend\logs\app.log' -Tail 20"
    echo %CYAN%----------------------------------------%RESET%
) else (
    echo %YELLOW%⚠ No application logs found%RESET%
)

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
echo %CYAN%================================================================================
echo                        MB Construction Project Launcher
echo                           Building Tomorrow, Today
echo ================================================================================%RESET%
echo.
goto :show_options

:show_options
echo %MAGENTA%🚀 Startup Options:%RESET%
echo %WHITE%   [1] Start Full Application (Backend + Frontend)%RESET%
echo %WHITE%   [2] Start Backend Only%RESET%
echo %WHITE%   [3] Start Frontend Only%RESET%
echo %WHITE%   [4] Run Database Setup%RESET%
echo %WHITE%   [5] Check System Status%RESET%
echo %WHITE%   [6] View Recent Logs%RESET%
echo %WHITE%   [7] Exit%RESET%
echo.

set /p choice=%CYAN%Enter your choice (1-7): %RESET%

if "%choice%"=="1" goto :start_full
if "%choice%"=="2" goto :start_backend
if "%choice%"=="3" goto :start_frontend
if "%choice%"=="4" goto :setup_database
if "%choice%"=="5" goto :check_status
if "%choice%"=="6" goto :view_logs
if "%choice%"=="7" goto :exit
goto :invalid_choice

:exit
echo.
echo %GREEN%Thank you for using MB Construction Project Launcher!%RESET%
echo %WHITE%Building Tomorrow, Today 🏗️%RESET%
echo.
timeout /t 2 /nobreak >nul
exit /b 0