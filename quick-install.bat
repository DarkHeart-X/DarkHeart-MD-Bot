@echo off
echo 🖤 DarkHeart Bot - Quick CMD Installation 🖤
echo.

REM Quick installation commands
echo [1/4] Checking Node.js...
node --version || (echo ❌ Install Node.js from https://nodejs.org/ & pause & exit)

echo [2/4] Installing dependencies...
npm install

echo [3/4] Creating directories...
mkdir data media media\images media\videos media\audio 2>nul

echo [4/4] Testing bot...
node -c index.js && echo ✅ Bot ready! || (echo ❌ Bot has errors & pause & exit)

echo.
echo 🎉 Installation complete!
echo.
echo 🚀 Start the bot with: npm start
echo 📱 Then scan QR code or use pairing code
echo.
pause
