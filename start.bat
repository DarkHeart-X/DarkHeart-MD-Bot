@echo off
title DarkHeart WhatsApp Bot
color 0F
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                  🖤 DarkHeart WhatsApp Bot 🖤                ║
echo ║                         Version 1.0.0                        ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo [INFO] Checking dependencies...
if not exist "node_modules" (
    echo [ERROR] Dependencies not found! Please run install.bat first.
    pause
    exit /b 1
)

echo [INFO] Starting bot...
echo [INFO] Time: %date% %time%
echo.
echo 📱 CONNECTION OPTIONS:
echo • Scan QR Code with WhatsApp
echo • Or enter phone number for pairing code
echo.
echo 🔧 CONFIGURATION:
echo • All features start as OFF (privacy-first)
echo • Use !settings to configure features
echo • Bot owner receives all notifications
echo.
echo 🖤 Press Ctrl+C to stop the bot
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

node index.js

echo.
echo 🖤 DarkHeart Bot has stopped.
pause
