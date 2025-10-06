@echo off
echo ========================================
echo MB Construction - Admin System Setup
echo ========================================
echo.

echo 🚀 Setting up admin system...
node setup-admin-system.js

echo.
echo ========================================
echo Setup complete! 
echo ========================================
echo.

echo Would you like to run the connection tests? (y/n)
set /p choice=

if /i "%choice%"=="y" (
    echo.
    echo 🧪 Running admin system tests...
    echo Please make sure the backend server is running first!
    echo.
    pause
    node test-admin-system.js
)

echo.
echo ========================================
echo Admin System Ready!
echo ========================================
echo.
echo 📝 Quick Start:
echo 1. Start backend: cd backend ^&^& npm start
echo 2. Register admin: http://localhost:8080/admin-register.html
echo 3. Login: http://localhost:8080/admin.html
echo 4. Registration code: MB2024ADMIN
echo.
pause