@echo off
title MB Construction - Database Manager
color 0A
setlocal enabledelayedexpansion

:main_menu
cls
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║            MB Construction - Database Manager                ║
echo ║                 Advanced Database Operations                 ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Check MongoDB status
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo 🟢 MongoDB Status: RUNNING
) else (
    echo 🔴 MongoDB Status: NOT RUNNING
    echo    💡 Start with: net start MongoDB
)

echo.
echo 📊 Database Operations Menu:
echo.
echo [1] 📈 Show Database Statistics
echo [2] 🌱 Seed Sample Data
echo [3] ✅ Validate Database Integrity
echo [4] 📦 Create Database Backup
echo [5] 🔄 Reset Database (⚠️ Destructive)
echo [6] ⚡ Optimize Database Performance
echo [7] 🔍 Test Database Connection
echo [8] 📋 Show Collections Info
echo [9] 🚀 Start MongoDB Service
echo [0] ❌ Exit
echo.
set /p choice="Enter your choice (0-9): "

if "%choice%"=="1" goto show_stats
if "%choice%"=="2" goto seed_data
if "%choice%"=="3" goto validate_db
if "%choice%"=="4" goto backup_db
if "%choice%"=="5" goto reset_db
if "%choice%"=="6" goto optimize_db
if "%choice%"=="7" goto test_connection
if "%choice%"=="8" goto show_collections
if "%choice%"=="9" goto start_mongodb
if "%choice%"=="0" goto exit
goto main_menu

:show_stats
echo.
echo 📈 Generating Database Statistics...
cd backend
npm run db:stats
echo.
pause
cd ..
goto main_menu

:seed_data
echo.
echo 🌱 Seeding Sample Data...
echo ⚠️  This will add sample data to your database
set /p confirm="Continue? (Y/N): "
if /i "%confirm%"=="Y" (
    cd backend
    npm run db:seed
    echo.
    echo ✅ Sample data seeding completed
    cd ..
) else (
    echo ❌ Seeding cancelled
)
echo.
pause
goto main_menu

:validate_db
echo.
echo ✅ Validating Database Integrity...
cd backend
npm run db:validate
echo.
pause
cd ..
goto main_menu

:backup_db
echo.
echo 📦 Creating Database Backup...
cd backend
npm run db:backup
echo.
echo ✅ Backup operation completed
echo 💾 Backup files are stored in backend/backups/
echo.
pause
cd ..
goto main_menu

:reset_db
echo.
echo ⚠️  WARNING: DATABASE RESET OPERATION
echo.
echo 🚨 This will permanently delete ALL data in the database!
echo    • All contacts will be lost
echo    • All projects will be lost
echo    • All custom data will be lost
echo.
echo 💡 Consider creating a backup first (option 4)
echo.
set /p confirm1="Are you absolutely sure? Type 'RESET' to confirm: "
if "%confirm1%"=="RESET" (
    echo.
    echo 🗑️  Proceeding with database reset...
    cd backend
    npm run db:reset
    echo.
    echo ✅ Database reset completed
    echo 🌱 You may want to seed sample data (option 2)
    cd ..
) else (
    echo ❌ Reset cancelled - database is safe
)
echo.
pause
goto main_menu

:optimize_db
echo.
echo ⚡ Optimizing Database Performance...
cd backend
npm run db:optimize
echo.
echo ✅ Database optimization completed
echo.
pause
cd ..
goto main_menu

:test_connection
echo.
echo 🔍 Testing Database Connection...
cd backend
node -e "
const mongoose = require('mongoose');
console.log('🔄 Connecting to MongoDB...');
mongoose.connect('mongodb://localhost:27017/mb_construction', {
  serverSelectionTimeoutMS: 5000
}).then(() => {
  console.log('✅ Database connection successful');
  console.log('📊 Database:', mongoose.connection.db.databaseName);
  console.log('🌐 Host:', mongoose.connection.host);
  console.log('🔌 Port:', mongoose.connection.port);
  return mongoose.disconnect();
}).then(() => {
  console.log('🔌 Connection closed gracefully');
  process.exit(0);
}).catch(err => {
  console.log('❌ Database connection failed:', err.message);
  process.exit(1);
});
"
echo.
pause
cd ..
goto main_menu

:show_collections
echo.
echo 📋 Showing Collections Information...
cd backend
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mb_construction').then(async () => {
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('📊 Database Collections:');
  console.log('========================');
  for (const collection of collections) {
    const count = await db.collection(collection.name).countDocuments();
    console.log('📁', collection.name + ':', count, 'documents');
  }
  await mongoose.disconnect();
  process.exit(0);
}).catch(err => {
  console.log('❌ Error:', err.message);
  process.exit(1);
});
"
echo.
pause
cd ..
goto main_menu

:start_mongodb
echo.
echo 🚀 Starting MongoDB Service...
net start MongoDB
if %errorlevel% equ 0 (
    echo ✅ MongoDB service started successfully
) else (
    echo ⚠️  Service start failed, trying manual start...
    start "MongoDB Server" /MIN mongod --dbpath "C:\data\db"
    timeout /t 3 /nobreak >nul
    echo ✅ MongoDB started manually
)
echo.
pause
goto main_menu

:exit
echo.
echo 👋 Thank you for using MB Construction Database Manager!
echo.
exit /b 0