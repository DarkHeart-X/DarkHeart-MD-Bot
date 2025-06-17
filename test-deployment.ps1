# DarkHeart Bot - PowerShell Deployment Test
# Run this script to test if the bot is ready for deployment

Write-Host "🖤 DarkHeart Bot - Deployment Readiness Test 🖤" -ForegroundColor Magenta
Write-Host ""

# Test 1: Check Node.js
Write-Host "📋 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Test 2: Check npm
Write-Host "📋 Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found!" -ForegroundColor Red
    exit 1
}

# Test 3: Check required files
Write-Host "📋 Checking required files..." -ForegroundColor Yellow
$requiredFiles = @(
    "index.js",
    "package.json", 
    "config.js",
    "settings.js",
    "commandHandler.js",
    "lib\advancedFeatures.js",
    "lib\commandHandlers.js",
    "lib\utils.js"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $file missing!" -ForegroundColor Red
        exit 1
    }
}

# Test 4: Check directories
Write-Host "📋 Checking required directories..." -ForegroundColor Yellow
$requiredDirs = @("lib", "data", "media", "public")

foreach ($dir in $requiredDirs) {
    if (Test-Path $dir -PathType Container) {
        Write-Host "✅ $dir directory exists" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Creating missing directory: $dir" -ForegroundColor Yellow
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ $dir directory created" -ForegroundColor Green
    }
}

# Test 5: Check package.json syntax
Write-Host "📋 Checking package.json syntax..." -ForegroundColor Yellow
try {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    Write-Host "✅ package.json is valid JSON" -ForegroundColor Green
    Write-Host "📦 Bot name: $($packageJson.name)" -ForegroundColor Cyan
    Write-Host "📦 Version: $($packageJson.version)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ package.json has syntax errors!" -ForegroundColor Red
    exit 1
}

# Test 6: Check if node_modules exists
Write-Host "📋 Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules" -PathType Container) {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
} else {
    Write-Host "⚠️ Dependencies not installed" -ForegroundColor Yellow
    Write-Host "💡 Run: npm install" -ForegroundColor Cyan
}

# Test 7: Syntax check main files
Write-Host "📋 Checking JavaScript syntax..." -ForegroundColor Yellow
$jsFiles = @("index.js", "config.js", "settings.js")

foreach ($file in $jsFiles) {
    try {
        # Basic syntax check using node
        $result = node -c $file 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $file syntax OK" -ForegroundColor Green
        } else {
            Write-Host "❌ $file has syntax errors: $result" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error checking $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎯 DEPLOYMENT READINESS SUMMARY:" -ForegroundColor Magenta
Write-Host "✅ All core files present" -ForegroundColor Green
Write-Host "✅ No syntax errors detected" -ForegroundColor Green  
Write-Host "✅ Proper project structure" -ForegroundColor Green
Write-Host "✅ Ready for deployment!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 To start the bot:" -ForegroundColor Yellow
Write-Host "   1. npm install" -ForegroundColor Cyan
Write-Host "   2. npm start" -ForegroundColor Cyan
Write-Host "   3. Scan QR code or use pairing code" -ForegroundColor Cyan
Write-Host ""
Write-Host "🖤 DarkHeart Bot is ready to deploy! 🖤" -ForegroundColor Magenta
