@echo off
title MB Construction - Data Viewer
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║              MB Construction - Data Viewer                   ║
echo ║                View All Saved Website Data                   ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Check if MongoDB is running
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%" neq "0" (
    echo 🔴 MongoDB is not running!
    echo 💡 Starting MongoDB...
    net start MongoDB >nul 2>&1 || start "MongoDB" /MIN mongod --dbpath "C:\data\db"
    timeout /t 3 /nobreak >nul
)

echo 🔍 Checking saved data from your website...
echo.

cd backend
node view-data.js

echo.
echo 💡 Tips:
echo    • Submit contact forms on http://localhost:8080 to see data
echo    • Use db-manager.bat for more database operations
echo    • Run "npm run db:seed" to add sample data
echo.
pause