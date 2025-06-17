@echo off
title DarkHeart WhatsApp Bot - CMD Installer
color 0F

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                🖤 DarkHeart WhatsApp Bot 🖤                  ║
echo ║                    CMD Installation Guide                     ║
echo ║                        Version 1.0.0                         ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo [STEP 1] Checking system requirements...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo.
    echo 📥 Please install Node.js first:
    echo    1. Go to: https://nodejs.org/
    echo    2. Download the LTS version
    echo    3. Install and restart CMD
    echo    4. Run this script again
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js version: %NODE_VERSION%
)

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not available!
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm version: %NPM_VERSION%
)

echo.
echo [STEP 2] Creating required directories...

if not exist "data" mkdir data
if not exist "media" mkdir media
if not exist "media\images" mkdir media\images
if not exist "media\videos" mkdir media\videos
if not exist "media\audio" mkdir media\audio
if not exist "media\documents" mkdir media\documents
if not exist "media\status" mkdir media\status
if not exist "media\deleted" mkdir media\deleted
if not exist "media\temp" mkdir media\temp
if not exist "auth_info_baileys" mkdir auth_info_baileys

echo ✅ All directories created successfully

echo.
echo [STEP 3] Installing dependencies...
echo ⏳ This may take a few minutes...
echo.

npm install

if %errorlevel% neq 0 (
    echo.
    echo ❌ Failed to install dependencies!
    echo.
    echo 🔧 Troubleshooting steps:
    echo    1. Check your internet connection
    echo    2. Try running: npm cache clean --force
    echo    3. Delete node_modules folder and try again
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!

echo.
echo [STEP 4] Configuration setup...

if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo ✅ Environment file created from template
    ) else (
        echo # DarkHeart Bot Environment Variables > .env
        echo NODE_ENV=development >> .env
        echo BOT_PREFIX=! >> .env
        echo OWNER_NUMBER=923xxxxxxxxx@s.whatsapp.net >> .env
        echo ✅ Basic environment file created
    )
) else (
    echo ✅ Environment file already exists
)

echo.
echo [STEP 5] Testing installation...

REM Test main file syntax
node -c index.js
if %errorlevel% neq 0 (
    echo ❌ Syntax error in main bot file!
    pause
    exit /b 1
) else (
    echo ✅ Main bot file syntax OK
)

REM Test configuration file
node -c config.js
if %errorlevel% neq 0 (
    echo ❌ Syntax error in config file!
    pause
    exit /b 1
) else (
    echo ✅ Configuration file syntax OK
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                   🎉 INSTALLATION COMPLETE! 🎉               ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 🖤 DarkHeart WhatsApp Bot is ready to use!
echo.
echo 🚀 NEXT STEPS:
echo.
echo 1. Configure your owner number in config.js (optional)
echo 2. Start the bot with one of these commands:
echo.
echo    📱 Method 1 - Quick start:
echo       npm start
echo.
echo    📱 Method 2 - Use batch file:
echo       start.bat
echo.
echo    📱 Method 3 - Direct node command:
echo       node index.js
echo.
echo 📋 CONNECTION OPTIONS:
echo    • Scan QR Code with WhatsApp
echo    • OR enter phone number for pairing code
echo.
echo 🔧 AVAILABLE COMMANDS (after connection):
echo    • !menu    - Show all commands
echo    • !setup   - First-time setup guide
echo    • !settings - Configure features
echo    • !ping    - Test bot response
echo.
echo 🛡️ PRIVACY FEATURES:
echo    • All features start as OFF
echo    • 24-hour auto message deletion
echo    • Owner receives all notifications
echo.
echo ⚡ Ready to connect? Type: npm start
echo.
pause
