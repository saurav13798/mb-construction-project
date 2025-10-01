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
if "%COMMAND%"=="db" goto :database_menu
if "%COMMAND%"=="test" goto :run_tests
if "%COMMAND%"=="health" goto :health_check
if "%COMMAND%"=="help" goto :show_help

REM Default - show menu
:show_menu
echo Please select an option:
echo.
echo [1] Start Full Application (Frontend + Backend)
echo [2] Start Backend Only
echo [3] Start Frontend Only
echo [4] Database Operations
echo [5] Run Tests and Verification
echo [6] First Time Setup
echo [7] Health Check and Status
echo [8] Help and Information
echo [9] Exit
echo.
set /p choice="Enter your choice (1-9): "

if "%choice%"=="1" goto :start_full
if "%choice%"=="2" goto :start_backend
if "%choice%"=="3" goto :start_frontend
if "%choice%"=="4" goto :database_menu
if "%choice%"=="5" goto :run_tests
if "%choice%"=="6" goto :run_setup
if "%choice%"=="7" goto :health_check
if "%choice%"=="8" goto :show_help
if "%choice%"=="9" goto :exit
goto :show_menu

REM ========================================
REM   QUICK SYSTEM CHECK
REM ========================================
:quick_check
REM Set project root for robust pathing
set "ROOT=%~dp0"

REM Basic tool checks (Node.js and npm)
call :check_node
if errorlevel 1 goto :exit

REM Check if setup has been run
if not exist "backend\.env" (
    echo.
    echo WARNING: Project not set up yet!
    echo    Please run setup first.
    echo.
    set /p run_setup="Would you like to run setup now? (Y/N): "
    if /i "%run_setup%"=="Y" goto :run_setup
    goto :exit
)

REM Check if MongoDB is running
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo OK: MongoDB is running
) else (
    echo INFO: Starting MongoDB...
    net start MongoDB >nul 2>&1
    if "%ERRORLEVEL%"=="0" (
        echo OK: MongoDB started successfully
    ) else (
        echo INFO: Starting MongoDB manually...
        start "MongoDB Server" /MIN mongod --dbpath "C:\data\db"
        timeout /t 2 /nobreak >nul
    )
)
REM Optional: Check common dev ports
call :check_ports 3000 "Backend"
call :check_ports 8080 "Frontend"
exit /b 0

REM ========================================
REM   CHECK NODE/NPM AVAILABILITY
REM ========================================
:check_node
where node >nul 2>&1
if not "%ERRORLEVEL%"=="0" (
    echo.
    echo ERROR: Node.js not found in PATH. Please install Node.js (v16+ recommended).
    echo    Download: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
where npm >nul 2>&1
if not "%ERRORLEVEL%"=="0" (
    echo.
    echo ERROR: npm not found in PATH. Ensure Node.js installation added npm to PATH.
    echo.
    pause
    exit /b 1
)
exit /b 0

REM ========================================
REM   CHECK PORT USAGE (Windows)
REM ========================================
:check_ports
setlocal
set "PORT=%~1"
set "LABEL=%~2"
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /R ":%PORT% .*LISTENING"') do (
    echo WARNING: %LABEL% port %PORT% is already in use by PID %%p.
)
endlocal
exit /b 0

REM ========================================
REM   START FULL APPLICATION
REM ========================================
:start_full
echo.
echo ==============================================================
echo                  STARTING FULL APPLICATION                  
echo ==============================================================

call :quick_check

echo.
echo Starting both servers...

REM Start backend server
echo    Starting backend server...
call :ensure_logs
start "MB Construction Backend" cmd /k "cd /d "%~dp0backend" && if exist node_modules (echo [Backend] deps OK) else (echo [Backend] installing... && npm install) && echo [Backend] Starting dev server... && npm run dev"

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server
echo    Starting frontend server...
start "MB Construction Frontend" cmd /k "cd /d "%~dp0frontend" && if exist node_modules (echo [Frontend] deps OK) else (echo [Frontend] installing... && npm install) && echo [Frontend] Starting dev server... && npm start"

echo.
echo OK: Both servers are starting in separate windows
echo.
echo 🌐 Application URLs:
echo    • Frontend: http://localhost:8080
echo    • Backend API: http://localhost:3000
echo    • Health Check: http://localhost:3000/health
echo.
echo 📋 Server windows opened:
echo    • Backend server (development mode with auto-reload)
echo    • Frontend server (live development server)
echo.
set /p OPENURL="Open URLs in browser now? (Y/N): "
if /i "%OPENURL%"=="Y" (
    start "" http://localhost:8080
    start "" http://localhost:3000/health
)
echo Close the server windows when you're done working.
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

call :quick_check

echo.
echo Starting backend server...

set /p DOINS="Install/update backend dependencies first? (Y/N): "
if /i "%DOINS%"=="Y" (
    pushd "%~dp0backend"
    echo    Installing/updating dependencies...
    npm install
    popd
)

echo    Starting development server...
echo.
echo 🌐 Backend will be available at: http://localhost:3000
echo 🔍 Health check: http://localhost:3000/health
echo.
call :ensure_logs
pushd "%~dp0backend"
npm run dev
popd
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
echo Starting frontend server...

set /p DOINSFE="Install/update frontend dependencies first? (Y/N): "
if /i "%DOINSFE%"=="Y" (
    pushd "%~dp0frontend"
    echo    Installing/updating dependencies...
    npm install
    popd
)

echo    Starting development server...
echo.
echo 🌐 Frontend will be available at: http://localhost:8080
echo.
call :ensure_logs
pushd "%~dp0frontend"
npm start
popd
goto :exit

REM ========================================
REM   DATABASE OPERATIONS
REM ========================================
:database_menu
echo.
echo ==============================================================
echo                   DATABASE OPERATIONS                       
echo ==============================================================

call :quick_check

echo.
echo Database Operations Menu:
echo.
echo [1] 📊 Show Database Statistics
echo [2] 🌱 Seed Sample Data
echo [3] ✅ Validate Database
echo [4] 📦 Create Backup
echo [5] 🔄 Reset Database (Warning!)
echo [6] ⚡ Optimize Database
echo [7] 🔙 Back to Main Menu
echo.
set /p db_choice="Enter your choice (1-7): "

pushd "%~dp0backend"

if "%db_choice%"=="1" (
    echo.
    echo 📊 Generating database statistics...
    npm run db:stats
    pause
    popd
    goto :database_menu
)

if "%db_choice%"=="2" (
    echo.
    echo 🌱 Seeding sample data...
    npm run db:seed
    pause
    popd
    goto :database_menu
)

if "%db_choice%"=="3" (
    echo.
    echo ✅ Validating database integrity...
    npm run db:validate
    pause
    popd
    goto :database_menu
)

if "%db_choice%"=="4" (
    echo.
    echo 📦 Creating database backup...
    npm run db:backup
    pause
    popd
    goto :database_menu
)

if "%db_choice%"=="5" (
    echo.
    echo ⚠️  WARNING: This will delete all data!
    set /p confirm="Are you sure you want to reset the database? (Y/N): "
    if /i "%confirm%"=="Y" (
        echo 🗑️  Resetting database...
        npm run db:reset
    )
    pause
    popd
    goto :database_menu
)

if "%db_choice%"=="6" (
    echo.
    echo ⚡ Optimizing database...
    npm run db:optimize
    pause
    goto :database_menu
)

if "%db_choice%"=="7" (
    popd
    goto :show_menu
)

popd
goto :database_menu

REM ========================================
REM   RUN TESTS
REM ========================================
:run_tests
echo.
echo ==============================================================
echo                      RUNNING TESTS                          
echo ==============================================================

echo.
echo Running project tests and verification...

REM Run backend tests
echo    Running backend tests...
pushd "%~dp0backend"
npm test
popd

echo.
echo OK: Tests completed
pause
goto :show_menu

REM ========================================
REM   RUN SETUP
REM ========================================
:run_setup
echo.
echo 🛠️  Launching setup process...
call setup.bat
goto :exit

REM ========================================
REM   HEALTH CHECK & STATUS
REM ========================================
:health_check
echo.
echo ==============================================================
echo                    HEALTH CHECK STATUS                      
echo ==============================================================

echo.
echo Checking application health...

REM Check if backend is running
echo    Checking backend server...
npm run health

REM Check database status
echo    Checking database status...
npm run db:stats

REM Check system requirements
echo    Checking system requirements...
echo    Node.js version:
node --version
echo    npm version:
npm --version

REM Check MongoDB
echo    Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo    OK: MongoDB is running
) else (
    echo    ERROR: MongoDB is not running
)

echo.
echo OK: Health check completed
pause
goto :show_menu

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
echo    db        - Open database operations menu
echo    test      - Run tests and verification
echo    health    - Check application health and status
echo    help      - Show this help guide
echo.
echo 🎮 INTERACTIVE MODE:
echo    Run without arguments to see the interactive menu
echo.
echo 🌐 APPLICATION URLS:
echo    • Frontend: http://localhost:8080
echo    • Backend API: http://localhost:3000
echo    • Health Check: http://localhost:3000/health
echo.
echo 🚀 FIRST TIME SETUP:
echo    If you haven't set up the project yet:
echo    1. Run 'setup.bat' first
echo    2. Then use 'start.bat' for daily operations
echo.
echo 💡 DEVELOPMENT TIPS:
echo    • Use 'full' for complete development
echo    • Use 'backend' when working on API
echo    • Use 'frontend' when working on UI
echo    • Use 'db' for database management
echo.
echo 🛠️  TROUBLESHOOTING:
echo    • If servers don't start, run setup.bat again
echo    • Check if MongoDB is installed and running
echo    • Ensure Node.js v14+ is installed
echo    • Use database operations to reset if needed
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

REM ========================================
REM   HELPERS
REM ========================================
:ensure_logs
if not exist "%~dp0logs" (
    mkdir "%~dp0logs" >nul 2>&1
)
exit /b 0