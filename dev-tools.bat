@echo off
setlocal enabledelayedexpansion
title MB Construction - Developer Tools

:: Set colors
set "GREEN=[92m"
set "BLUE=[94m"
set "YELLOW=[93m"
set "RED=[91m"
set "CYAN=[96m"
set "WHITE=[97m"
set "RESET=[0m"

:menu
cls
echo.
echo %CYAN%================================================================================
echo                    MB Construction - Developer Tools
echo                        Advanced Development Utilities
echo ================================================================================%RESET%
echo.

echo %BLUE%🛠️ Developer Tools Menu:%RESET%
echo %WHITE%   [1] 🚀 Quick Start Application%RESET%
echo %WHITE%   [2] 🗄️ Database Management%RESET%
echo %WHITE%   [3] 📊 View Application Status%RESET%
echo %WHITE%   [4] 📋 View Logs%RESET%
echo %WHITE%   [5] 🧹 Clean Project%RESET%
echo %WHITE%   [6] 📦 Reinstall Dependencies%RESET%
echo %WHITE%   [7] 🔍 Test API Endpoints%RESET%
echo %WHITE%   [8] 📈 Performance Check%RESET%
echo %WHITE%   [9] 🔧 Project Information%RESET%
echo %WHITE%   [0] ❌ Exit%RESET%
echo.

set /p choice=%CYAN%Enter your choice (0-9): %RESET%

if "%choice%"=="1" goto :quick_start
if "%choice%"=="2" goto :database_menu
if "%choice%"=="3" goto :app_status
if "%choice%"=="4" goto :view_logs
if "%choice%"=="5" goto :clean_project
if "%choice%"=="6" goto :reinstall_deps
if "%choice%"=="7" goto :test_api
if "%choice%"=="8" goto :performance_check
if "%choice%"=="9" goto :project_info
if "%choice%"=="0" goto :exit
goto :invalid_choice

:quick_start
echo.
echo %GREEN%🚀 Starting MB Construction Application...%RESET%
echo.
call quick-start.bat
goto :menu

:database_menu
cls
echo.
echo %BLUE%🗄️ Database Management Tools:%RESET%
echo %WHITE%   [1] Initialize Database%RESET%
echo %WHITE%   [2] Seed Sample Data%RESET%
echo %WHITE%   [3] View Database Stats%RESET%
echo %WHITE%   [4] Backup Database%RESET%
echo %WHITE%   [5] Reset Database%RESET%
echo %WHITE%   [6] Check Contacts%RESET%
echo %WHITE%   [7] Count All Data%RESET%
echo %WHITE%   [8] Back to Main Menu%RESET%
echo.

set /p db_choice=%CYAN%Enter your choice (1-8): %RESET%

if "%db_choice%"=="1" (
    echo %WHITE%Initializing database...%RESET%
    cd backend && call npm run db:init && cd ..
)
if "%db_choice%"=="2" (
    echo %WHITE%Seeding database...%RESET%
    cd backend && call npm run db:seed && cd ..
)
if "%db_choice%"=="3" (
    echo %WHITE%Database statistics:%RESET%
    cd backend && call npm run db:stats && cd ..
)
if "%db_choice%"=="4" (
    echo %WHITE%Creating database backup...%RESET%
    cd backend && call npm run db:backup && cd ..
)
if "%db_choice%"=="5" (
    echo %YELLOW%⚠ This will delete all data! Are you sure? (y/N)%RESET%
    set /p confirm=
    if /i "!confirm!"=="y" (
        cd backend && call npm run db:reset && cd ..
    )
)
if "%db_choice%"=="6" (
    echo %WHITE%Checking contacts...%RESET%
    call npm run check-contacts
)
if "%db_choice%"=="7" (
    echo %WHITE%Counting all data...%RESET%
    call npm run count-data
)
if "%db_choice%"=="8" goto :menu

echo.
pause
goto :database_menu

:app_status
echo.
echo %BLUE%📊 Application Status:%RESET%
echo.

:: Check Node.js processes
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
echo %WHITE%MongoDB Service:%RESET%
sc query MongoDB 2>nul | find "STATE"

echo.
echo %WHITE%Application Health Check:%RESET%
call npm run health 2>nul

echo.
pause
goto :menu

:view_logs
echo.
echo %BLUE%📋 Application Logs:%RESET%
echo.

if exist "backend\logs\app.log" (
    echo %WHITE%Recent application logs:%RESET%
    echo %CYAN%----------------------------------------%RESET%
    powershell "Get-Content 'backend\logs\app.log' -Tail 30"
    echo %CYAN%----------------------------------------%RESET%
) else (
    echo %YELLOW%No application logs found%RESET%
)

echo.
pause
goto :menu

:clean_project
echo.
echo %YELLOW%🧹 Cleaning Project Files...%RESET%
echo.

echo %WHITE%Cleaning node_modules and lock files...%RESET%
call npm run clean:all

echo %GREEN%✓ Project cleaned successfully%RESET%
echo.
pause
goto :menu

:reinstall_deps
echo.
echo %BLUE%📦 Reinstalling Dependencies...%RESET%
echo.

echo %WHITE%Cleaning existing dependencies...%RESET%
call npm run clean

echo %WHITE%Installing root dependencies...%RESET%
call npm install

echo %WHITE%Installing backend dependencies...%RESET%
cd backend && call npm install && cd ..

echo %GREEN%✓ Dependencies reinstalled successfully%RESET%
echo.
pause
goto :menu

:test_api
echo.
echo %BLUE%🔍 Testing API Endpoints...%RESET%
echo.

echo %WHITE%Testing health endpoint...%RESET%
curl -s http://localhost:3000/health 2>nul || echo %YELLOW%Server not responding%RESET%

echo.
echo %WHITE%Testing contact endpoint...%RESET%
curl -s -X POST http://localhost:3000/api/contact -H "Content-Type: application/json" -d "{\"name\":\"Test\",\"email\":\"test@example.com\",\"message\":\"Test message\"}" 2>nul || echo %YELLOW%Contact API not responding%RESET%

echo.
pause
goto :menu

:performance_check
echo.
echo %BLUE%📈 Performance Check...%RESET%
echo.

echo %WHITE%System Information:%RESET%
echo CPU: %PROCESSOR_IDENTIFIER%
echo Memory: 
wmic computersystem get TotalPhysicalMemory /value | find "="

echo.
echo %WHITE%Node.js Memory Usage:%RESET%
node -e "const used = process.memoryUsage(); console.log('RSS:', Math.round(used.rss / 1024 / 1024), 'MB'); console.log('Heap Used:', Math.round(used.heapUsed / 1024 / 1024), 'MB');"

echo.
echo %WHITE%Disk Space:%RESET%
dir /-c | find "bytes free"

echo.
pause
goto :menu

:project_info
echo.
echo %BLUE%🔧 Project Information:%RESET%
echo.

echo %WHITE%Project Details:%RESET%
if exist "package.json" (
    node -e "const pkg = require('./package.json'); console.log('Name:', pkg.name); console.log('Version:', pkg.version); console.log('Description:', pkg.description);"
)

echo.
echo %WHITE%Environment:%RESET%
echo Node.js Version: 
node --version
echo npm Version: 
npm --version
echo Current Directory: %CD%

echo.
echo %WHITE%Project Structure:%RESET%
dir /b | find /v "node_modules"

echo.
pause
goto :menu

:invalid_choice
echo.
echo %RED%❌ Invalid choice. Please select 0-9.%RESET%
timeout /t 2 /nobreak >nul
goto :menu

:exit
echo.
echo %GREEN%Thank you for using MB Construction Developer Tools!%RESET%
echo %WHITE%Happy coding! 🚀%RESET%
echo.
timeout /t 2 /nobreak >nul
exit /b 0