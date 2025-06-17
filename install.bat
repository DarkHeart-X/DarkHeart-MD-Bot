@echo off
echo 🖤 DarkHeart WhatsApp Bot Installer 🖤
echo.
echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js detected

echo.
echo [2/4] Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies!
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo [3/4] Creating required directories...
if not exist "data" mkdir data
if not exist "media" mkdir media
if not exist "media\images" mkdir media\images
if not exist "media\videos" mkdir media\videos
if not exist "media\audio" mkdir media\audio
if not exist "media\documents" mkdir media\documents
if not exist "media\status" mkdir media\status
if not exist "media\deleted" mkdir media\deleted
if not exist "auth_info_baileys" mkdir auth_info_baileys
echo ✅ Directories created

echo.
echo [4/4] Setting up configuration...
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env >nul 2>&1
)
echo ✅ Configuration ready

echo.
echo 🎉 Installation Complete! 🎉
echo.
echo 📱 SETUP INSTRUCTIONS:
echo 1. Edit config.js to set your owner number
echo 2. Run: npm start
echo 3. Choose QR code or pairing code method
echo 4. For pairing code: Enter your WhatsApp number with country code
echo 5. Enter the pairing code in WhatsApp > Linked Devices
echo.
echo 🖤 DarkHeart Bot Features:
echo • Anti-delete messages
echo • Auto reactions with emotion detection  
echo • Status monitoring and saving
echo • Anti-link protection
echo • Auto view-once bypass
echo • Owner notifications for all activities
echo.
echo 🚀 Ready to start! Run: npm start
echo.
pause
