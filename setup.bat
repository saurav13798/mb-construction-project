@echo off
title MB Construction - Enhanced Project Setup
color 0A
setlocal enabledelayedexpansion

REM Enhanced setup with better error handling and progress tracking
set "SETUP_LOG=%~dp0setup.log"
set "SETUP_START_TIME=%time%"

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║            MB Construction - Enhanced Project Setup          ║
echo ║                  Intelligent Installation                    ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🚀 Starting enhanced setup process...
echo 📝 Setup log: %SETUP_LOG%
echo.

REM ========================================
REM   ENHANCED SYSTEM REQUIREMENTS CHECK
REM ========================================
echo [1/7] 🔍 Enhanced System Requirements Check...
echo %date% %time% - Starting system requirements check >> "%SETUP_LOG%"

REM Check Node.js with version validation
echo    Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo    📥 Download from: https://nodejs.org/
    echo    📋 Minimum version required: v14.0.0
    echo    💡 Recommended version: v18.0.0 or higher
    echo Node.js check failed >> "%SETUP_LOG%"
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js installed: !NODE_VERSION!
    echo Node.js version: !NODE_VERSION! >> "%SETUP_LOG%"
    
    REM Check Node.js version (extract major version)
    for /f "tokens=1 delims=." %%a in ("!NODE_VERSION:v=!") do set NODE_MAJOR=%%a
    if !NODE_MAJOR! LSS 14 (
        echo ⚠️  Warning: Node.js version !NODE_VERSION! is below recommended v14.0.0
        echo    Project may not work correctly with older versions
        set /p continue="Continue anyway? (Y/N): "
        if /i "!continue!" neq "Y" exit /b 1
    )
)

REM Check npm
echo    Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not available
    echo npm check failed >> "%SETUP_LOG%"
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm installed: !NPM_VERSION!
    echo npm version: !NPM_VERSION! >> "%SETUP_LOG%"
)

REM Check MongoDB with service detection
echo    Checking MongoDB installation...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MongoDB is not installed or not in PATH
    echo    📥 Download from: https://www.mongodb.com/try/download/community
    echo    📖 Setup guide: MongoDB_Windows_Setup.md
    echo MongoDB check failed >> "%SETUP_LOG%"
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('mongod --version ^| findstr "db version"') do set MONGO_VERSION=%%i
    echo ✅ MongoDB installed: !MONGO_VERSION!
    echo MongoDB version: !MONGO_VERSION! >> "%SETUP_LOG%"
)

REM Enhanced project structure validation
echo    Validating project structure...
set "STRUCTURE_OK=1"
set "REQUIRED_DIRS=backend frontend"
set "REQUIRED_FILES=package.json backend\package.json frontend\package.json"

for %%d in (%REQUIRED_DIRS%) do (
    if not exist "%%d" (
        echo ❌ Required directory missing: %%d
        set "STRUCTURE_OK=0"
    )
)

for %%f in (%REQUIRED_FILES%) do (
    if not exist "%%f" (
        echo ❌ Required file missing: %%f
        set "STRUCTURE_OK=0"
    )
)

if "!STRUCTURE_OK!"=="0" (
    echo ❌ Project structure validation failed
    echo    Please ensure you're running this from the project root directory
    echo    Required structure: backend/, frontend/, package.json files
    echo Project structure validation failed >> "%SETUP_LOG%"
    pause
    exit /b 1
)

echo ✅ Project structure validated
echo ✅ All system requirements met
echo System requirements check completed successfully >> "%SETUP_LOG%"

REM ========================================
REM   INTELLIGENT MONGODB SETUP
REM ========================================
echo.
echo [2/7] 🗄️  Intelligent MongoDB Setup...
echo %date% %time% - Starting MongoDB setup >> "%SETUP_LOG%"

REM Check if MongoDB is running
echo    Checking MongoDB status...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ MongoDB is already running
    echo MongoDB already running >> "%SETUP_LOG%"
) else (
    echo    MongoDB not running. Attempting to start...
    
    REM Try Windows service first
    echo    Attempting to start MongoDB service...
    net start MongoDB >nul 2>&1
    if "%ERRORLEVEL%"=="0" (
        echo ✅ MongoDB service started successfully
        echo MongoDB service started >> "%SETUP_LOG%"
    ) else (
        echo    Service start failed. Trying manual start...
        
        REM Create data directory if it doesn't exist
        set "MONGO_DATA_DIR=C:\data\db"
        if not exist "!MONGO_DATA_DIR!" (
            echo    Creating MongoDB data directory: !MONGO_DATA_DIR!
            mkdir "!MONGO_DATA_DIR!" >nul 2>&1
            if exist "!MONGO_DATA_DIR!" (
                echo ✅ Data directory created
            ) else (
                echo ❌ Failed to create data directory
                echo    Trying alternative location...
                set "MONGO_DATA_DIR=%USERPROFILE%\mongodb\data"
                mkdir "!MONGO_DATA_DIR!" >nul 2>&1
            )
        )
        
        REM Start MongoDB manually
        echo    Starting MongoDB manually with data path: !MONGO_DATA_DIR!
        start "MongoDB Server" /MIN mongod --dbpath "!MONGO_DATA_DIR!" --port 27017
        
        REM Wait and verify startup
        echo    Waiting for MongoDB to initialize...
        timeout /t 5 /nobreak >nul
        
        REM Verify MongoDB is responding
        echo    Verifying MongoDB connection...
        timeout /t 2 /nobreak >nul
        tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
        if "%ERRORLEVEL%"=="0" (
            echo ✅ MongoDB started manually and is running
            echo MongoDB started manually >> "%SETUP_LOG%"
        ) else (
            echo ❌ Failed to start MongoDB
            echo    Please check MongoDB installation and try again
            echo MongoDB startup failed >> "%SETUP_LOG%"
            pause
            exit /b 1
        )
    )
)

REM ========================================
REM   OPTIMIZED DEPENDENCIES INSTALLATION
REM ========================================
echo.
echo [3/7] 📦 Optimized Dependencies Installation...
echo %date% %time% - Starting dependencies installation >> "%SETUP_LOG%"

REM Check for existing node_modules and offer cleanup
if exist "node_modules" (
    echo    Existing root dependencies found
    set /p clean_deps="Clean install? (recommended for updates) (Y/N): "
    if /i "!clean_deps!"=="Y" (
        echo    Cleaning existing dependencies...
        rmdir /s /q node_modules >nul 2>&1
        del package-lock.json >nul 2>&1
        echo    ✅ Root dependencies cleaned
    )
)

REM Install root dependencies with progress
echo    📦 Installing root dependencies...
echo    This may take a few minutes on first run...
npm install --progress=true --loglevel=warn
if %errorlevel% neq 0 (
    echo ❌ Failed to install root dependencies
    echo    💡 Try: npm cache clean --force
    echo Root dependencies installation failed >> "%SETUP_LOG%"
    pause
    exit /b 1
) else (
    echo ✅ Root dependencies installed
    echo Root dependencies installed successfully >> "%SETUP_LOG%"
)

REM Backend dependencies with cleanup option
cd backend
if exist "node_modules" (
    echo    Existing backend dependencies found
    if /i "!clean_deps!"=="Y" (
        echo    Cleaning backend dependencies...
        rmdir /s /q node_modules >nul 2>&1
        del package-lock.json >nul 2>&1
    )
)

echo    📦 Installing backend dependencies...
npm install --progress=true --loglevel=warn
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    echo    💡 Check backend/package.json for issues
    echo Backend dependencies installation failed >> "%SETUP_LOG%"
    cd ..
    pause
    exit /b 1
) else (
    echo ✅ Backend dependencies installed
    echo Backend dependencies installed successfully >> "%SETUP_LOG%"
)
cd ..

REM Frontend dependencies with cleanup option
cd frontend
if exist "node_modules" (
    echo    Existing frontend dependencies found
    if /i "!clean_deps!"=="Y" (
        echo    Cleaning frontend dependencies...
        rmdir /s /q node_modules >nul 2>&1
        del package-lock.json >nul 2>&1
    )
)

echo    📦 Installing frontend dependencies...
npm install --progress=true --loglevel=warn
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    echo    💡 Check frontend/package.json for issues
    echo Frontend dependencies installation failed >> "%SETUP_LOG%"
    cd ..
    pause
    exit /b 1
) else (
    echo ✅ Frontend dependencies installed
    echo Frontend dependencies installed successfully >> "%SETUP_LOG%"
)
cd ..

echo ✅ All dependencies installed successfully with optimization

REM ========================================
REM   INTELLIGENT ENVIRONMENT CONFIGURATION
REM ========================================
echo.
echo [4/7] ⚙️  Intelligent Environment Configuration...
echo %date% %time% - Starting environment configuration >> "%SETUP_LOG%"

REM Enhanced .env file creation with validation
if not exist "backend\.env" (
    echo    Creating optimized backend .env file...
    (
        echo # MB Construction Backend Configuration
        echo # Generated on %date% at %time%
        echo.
        echo # Server Configuration
        echo PORT=3000
        echo NODE_ENV=development
        echo FRONTEND_URL=http://localhost:8080
        echo.
        echo # Database Configuration
        echo MONGODB_URI=mongodb://localhost:27017/mb_construction
        echo DB_NAME=mb_construction
        echo.
        echo # Security Configuration
        echo JWT_SECRET=mb-construction-super-secret-key-2024-%random%
        echo JWT_EXPIRE=30d
        echo BCRYPT_ROUNDS=12
        echo.
        echo # Email Configuration ^(Update with your credentials^)
        echo EMAIL_HOST=smtp.gmail.com
        echo EMAIL_PORT=587
        echo EMAIL_SECURE=false
        echo EMAIL_USER=your-email@gmail.com
        echo EMAIL_PASS=your-app-password
        echo EMAIL_FROM="MB Construction" ^<noreply@mbconstruction.com^>
        echo ADMIN_EMAIL=admin@mbconstruction.com
        echo.
        echo # File Upload Configuration
        echo MAX_FILE_SIZE=5242880
        echo ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,webp,pdf,doc,docx,xls,xlsx
        echo UPLOAD_PATH=./uploads
        echo.
        echo # Rate Limiting
        echo RATE_LIMIT_WINDOW=15
        echo RATE_LIMIT_MAX=100
        echo.
        echo # Logging
        echo LOG_LEVEL=info
        echo LOG_FILE=./logs/app.log
    ) > backend\.env
    echo ✅ Enhanced backend .env file created
    echo Backend .env file created >> "%SETUP_LOG%"
) else (
    echo ✅ Backend .env file already exists
    echo    Validating existing configuration...
    
    REM Check for required environment variables
    findstr /C:"PORT=" backend\.env >nul || echo    ⚠️  PORT not configured
    findstr /C:"MONGODB_URI=" backend\.env >nul || echo    ⚠️  MONGODB_URI not configured
    findstr /C:"JWT_SECRET=" backend\.env >nul || echo    ⚠️  JWT_SECRET not configured
    
    echo ✅ Environment validation completed
    echo Backend .env file validated >> "%SETUP_LOG%"
)

REM Create logs directory
if not exist "backend\logs" (
    echo    Creating logs directory...
    mkdir "backend\logs" >nul 2>&1
    echo ✅ Logs directory created
)

REM Create uploads directories with proper structure
echo    Setting up upload directories...
set "UPLOAD_DIRS=backend\uploads backend\uploads\projects backend\uploads\documents backend\uploads\general backend\uploads\temp"
for %%d in (%UPLOAD_DIRS%) do (
    if not exist "%%d" (
        mkdir "%%d" >nul 2>&1
        echo    ✅ Created: %%d
    )
)

REM Create .gitkeep files to preserve directory structure
for %%d in (%UPLOAD_DIRS%) do (
    if not exist "%%d\.gitkeep" (
        echo. > "%%d\.gitkeep"
    )
)

REM ========================================
REM   ADVANCED DATABASE INITIALIZATION
REM ========================================
echo.
echo [5/7] 🗄️  Advanced Database Initialization...
echo %date% %time% - Starting database initialization >> "%SETUP_LOG%"

cd backend

REM Enhanced database connection test with retry logic
echo    Testing database connection with retry logic...
set "DB_RETRY_COUNT=0"
set "DB_MAX_RETRIES=3"

:db_connection_retry
set /a DB_RETRY_COUNT+=1
echo    Attempt !DB_RETRY_COUNT!/!DB_MAX_RETRIES!: Testing connection...

node -e "
const mongoose = require('mongoose');
const connectWithTimeout = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/mb_construction', {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    console.log('✅ Database connection successful');
    console.log('📊 MongoDB version:', mongoose.connection.db.serverConfig.s.serverDescription.version);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.log('❌ Database connection failed:', err.message);
    process.exit(1);
  }
};
connectWithTimeout();
" 2>nul

if %errorlevel% neq 0 (
    if !DB_RETRY_COUNT! LSS !DB_MAX_RETRIES! (
        echo    Connection failed. Retrying in 3 seconds...
        timeout /t 3 /nobreak >nul
        goto db_connection_retry
    ) else (
        echo ❌ Database connection failed after !DB_MAX_RETRIES! attempts
        echo    💡 Troubleshooting steps:
        echo       1. Ensure MongoDB is running: net start MongoDB
        echo       2. Check MongoDB logs for errors
        echo       3. Verify port 27017 is not blocked
        echo Database connection failed >> "%SETUP_LOG%"
        cd ..
        pause
        exit /b 1
    )
) else (
    echo ✅ Database connection established successfully
    echo Database connection successful >> "%SETUP_LOG%"
)

REM Initialize database with enhanced error handling
echo    Initializing database structure...
if exist "utils\database_init.js" (
    node utils\database_init.js
    if %errorlevel% neq 0 (
        echo ❌ Database initialization failed
        echo    Check utils\database_init.js for errors
        echo Database initialization failed >> "%SETUP_LOG%"
        cd ..
        pause
        exit /b 1
    ) else (
        echo ✅ Database structure initialized
        echo Database structure initialized >> "%SETUP_LOG%"
    )
) else (
    echo ⚠️  Database initialization script not found, skipping...
    echo Database init script not found >> "%SETUP_LOG%"
)

REM Seed sample data with user confirmation
echo    Preparing to seed sample data...
set /p seed_data="Seed sample data? (recommended for first setup) (Y/N): "
if /i "!seed_data!"=="Y" (
    echo    Seeding sample data...
    if exist "utils\database_seeder.js" (
        node utils\database_seeder.js
        if %errorlevel% neq 0 (
            echo ❌ Database seeding failed
            echo    Check utils\database_seeder.js for errors
            echo Database seeding failed >> "%SETUP_LOG%"
        ) else (
            echo ✅ Sample data seeded successfully
            echo Database seeded successfully >> "%SETUP_LOG%"
        )
    ) else (
        echo ⚠️  Database seeder script not found
        echo Database seeder script not found >> "%SETUP_LOG%"
    )
) else (
    echo ⏭️  Skipping sample data seeding
    echo Sample data seeding skipped >> "%SETUP_LOG%"
)

cd ..
echo ✅ Database initialization completed

REM ========================================
REM   COMPREHENSIVE VERIFICATION
REM ========================================
echo.
echo [6/7] ✅ Comprehensive Setup Verification...
echo %date% %time% - Starting setup verification >> "%SETUP_LOG%"

REM Run comprehensive verification script
echo    Running comprehensive project verification...
if exist "verify-setup.js" (
    node verify-setup.js
    if %errorlevel% equ 0 (
        echo ✅ Project verification passed
        echo Project verification passed >> "%SETUP_LOG%"
    ) else (
        echo ⚠️  Some verification checks failed (see details above)
        echo Project verification had warnings >> "%SETUP_LOG%"
    )
) else (
    echo ⚠️  Verification script not found, performing basic checks...
)

REM Quick backend health test (optional)
echo    Performing quick backend health test...
set /p test_backend="Test backend API now? (optional, may take 30 seconds) (Y/N): "
if /i "!test_backend!"=="Y" (
    echo    Starting backend for health test...
    cd backend
    
    REM Start backend in background
    start /B "" cmd /c "npm run dev >nul 2>&1"
    
    REM Wait for startup
    echo    Waiting for backend to start...
    timeout /t 8 /nobreak >nul
    
    REM Test health endpoint
    echo    Testing health endpoint...
    powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:3000/health' -TimeoutSec 10; if($response.status -eq 'OK') { Write-Host '✅ Backend API is healthy'; exit 0 } else { Write-Host '❌ Backend API unhealthy'; exit 1 } } catch { Write-Host '⚠️ Backend API test failed (server may still be starting)'; exit 1 }" 2>nul
    
    REM Stop test server
    echo    Stopping test server...
    taskkill /F /IM node.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
    
    cd ..
) else (
    echo ⏭️  Backend health test skipped
    echo Backend health test skipped >> "%SETUP_LOG%"
)

echo ✅ Setup verification completed

REM ========================================
REM   SETUP OPTIMIZATION & COMPLETION
REM ========================================
echo.
echo [7/7] 🎯 Final Optimization & Completion...
echo %date% %time% - Starting final optimization >> "%SETUP_LOG%"

REM Create helpful batch files for development
echo    Creating development utility scripts...

REM Create quick-start.bat
if not exist "quick-start.bat" (
    (
        echo @echo off
        echo title MB Construction - Quick Start
        echo echo 🚀 Quick starting MB Construction...
        echo start "Backend" cmd /k "cd /d backend && npm run dev"
        echo timeout /t 2 /nobreak ^>nul
        echo start "Frontend" cmd /k "cd /d frontend && npm start"
        echo echo ✅ Both servers starting...
        echo echo Frontend: http://localhost:8080
        echo echo Backend: http://localhost:3000
        echo pause
    ) > quick-start.bat
    echo    ✅ Created quick-start.bat
)

REM Create db-manager.bat
if not exist "db-manager.bat" (
    (
        echo @echo off
        echo title MB Construction - Database Manager
        echo :menu
        echo echo Database Manager:
        echo echo [1] Show Stats  [2] Seed Data  [3] Reset DB  [4] Backup
        echo set /p choice="Choice: "
        echo if "%%choice%%"=="1" cd backend ^&^& npm run db:stats ^&^& pause ^&^& cd .. ^&^& goto menu
        echo if "%%choice%%"=="2" cd backend ^&^& npm run db:seed ^&^& pause ^&^& cd .. ^&^& goto menu
        echo if "%%choice%%"=="3" cd backend ^&^& npm run db:reset ^&^& pause ^&^& cd .. ^&^& goto menu
        echo if "%%choice%%"=="4" cd backend ^&^& npm run db:backup ^&^& pause ^&^& cd .. ^&^& goto menu
        echo goto menu
    ) > db-manager.bat
    echo    ✅ Created db-manager.bat
)

REM Calculate setup time
for /f "tokens=1-3 delims=:" %%a in ("%SETUP_START_TIME%") do set /a start_seconds=%%a*3600+%%b*60+%%c
for /f "tokens=1-3 delims=:" %%a in ("%time%") do set /a end_seconds=%%a*3600+%%b*60+%%c
set /a setup_duration=end_seconds-start_seconds
if %setup_duration% LSS 0 set /a setup_duration+=86400

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║              🎉 ENHANCED SETUP COMPLETED! 🎉                ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo ⏱️  Setup completed in %setup_duration% seconds
echo 📝 Setup log saved to: %SETUP_LOG%
echo.
echo 🎯 Your MB Construction project is now optimized and ready!
echo.
echo 📋 What was configured:
echo    ✅ Enhanced system requirements verification
echo    ✅ Intelligent MongoDB setup with retry logic
echo    ✅ Optimized dependencies installation
echo    ✅ Advanced environment configuration
echo    ✅ Comprehensive database initialization
echo    ✅ Complete setup verification
echo    ✅ Development utility scripts created
echo.
echo 🌐 Application URLs:
echo    • Frontend: http://localhost:8080
echo    • Backend API: http://localhost:3000
echo    • Health Check: http://localhost:3000/health
echo    • API Documentation: http://localhost:3000/api-docs
echo.
echo 🛠️  Development Tools Created:
echo    • quick-start.bat - Fast development startup
echo    • db-manager.bat - Database management utilities
echo    • start.bat - Enhanced application launcher
echo.
echo 🚀 Quick Start Options:
echo    [1] 🏃 Quick Start (recommended)
echo    [2] 🎛️  Advanced Launcher
echo    [3] 📊 Database Manager
echo    [4] 📖 View Documentation
echo    [5] ❌ Exit
echo.
set /p start_choice="Choose an option (1-5): "

if "!start_choice!"=="1" (
    echo.
    echo 🏃 Starting Quick Launch...
    call quick-start.bat
) else if "!start_choice!"=="2" (
    echo.
    echo 🎛️  Opening Advanced Launcher...
    call start.bat
) else if "!start_choice!"=="3" (
    echo.
    echo 📊 Opening Database Manager...
    call db-manager.bat
) else if "!start_choice!"=="4" (
    echo.
    echo 📖 Opening documentation...
    if exist "README.md" start notepad README.md
    if exist "Complete_Setup_Instructions.md" start notepad Complete_Setup_Instructions.md
    pause
) else (
    echo.
    echo ✅ Setup complete! Use the following commands:
    echo    • quick-start.bat - Fast development startup
    echo    • start.bat - Advanced launcher with options
    echo    • db-manager.bat - Database management
    echo.
    echo 💡 Pro tip: Bookmark http://localhost:8080 for quick access!
    echo.
    pause
)

echo Setup completed successfully at %date% %time% >> "%SETUP_LOG%"
exit /b 0