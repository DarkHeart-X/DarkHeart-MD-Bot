#!/bin/bash

# DarkHeart WhatsApp Bot - Pterodactyl Panel Entrypoint
# This script runs before starting the bot and ensures dependencies are installed

echo "🖤 DarkHeart Bot - Pterodactyl Setup 🖤"
echo "======================================"

# Make sure we're in the correct directory
cd /home/container || cd $(pwd)

# Ensure script has execution permissions
chmod +x entrypoint.sh 2>/dev/null || true

# Function to clean node_modules and reinstall if needed
clean_install() {
    echo "🧹 Cleaning node_modules for fresh installation..."
    rm -rf node_modules package-lock.json
    echo "📦 Installing dependencies from scratch..."
    npm cache clean --force
    npm install --production --no-audit --no-fund
    return $?
}

# Force reinstall if previous installation had issues
if [ -f ".npm_failed" ]; then
    echo "⚠️ Previous installation failed, forcing clean reinstall..."
    clean_install
    if [ $? -eq 0 ]; then
        rm -f .npm_failed
    else
        echo "❌ Still failing to install dependencies. Please check your package.json!"
        touch .npm_failed
        exit 1
    fi
fi

# Check if node_modules exists and install if missing
if [ ! -d "node_modules" ] || [ ! -d "node_modules/@whiskeysockets" ]; then
    echo "📦 node_modules missing or incomplete. Installing dependencies..."
    npm install --production --no-audit --no-fund
    
    # Check if installation succeeded
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies. Trying clean installation..."
        clean_install
        
        if [ $? -ne 0 ]; then
            echo "❌ Still failing to install dependencies. Please check logs!"
            touch .npm_failed
            exit 1
        fi
    fi
    
    echo "✅ Dependencies installed successfully!"
else
    echo "✅ Dependencies already installed!"
fi

# Create necessary directories
echo "📁 Ensuring required directories exist..."
if [ -f "scripts/create-directories.js" ]; then
    node scripts/create-directories.js
else
    echo "⚠️ create-directories.js not found, creating essential directories manually..."
    mkdir -p data/sessions media/images media/audio
fi

# Run the dependency check and fix any issues found
echo "🔧 Checking dependencies and patching if needed..."
if [ -f "scripts/check-dependencies.js" ]; then
    node scripts/check-dependencies.js
    
    # If check fails, run the patching script
    if [ $? -ne 0 ]; then
        echo "⚠️ Dependency issues detected. Applying fixes..."
        
        # Apply the Baileys patching
        if [ -f "scripts/patch-baileys.js" ]; then
            echo "🔧 Running Baileys patching..."
            node scripts/patch-baileys.js
            
            # Check again after patching
            node scripts/check-dependencies.js
            if [ $? -ne 0 ]; then
                echo "⚠️ Still having dependency issues after patching."
            else
                echo "✅ Patching successful!"
            fi
        else
            echo "❌ patch-baileys.js script not found."
        fi
    else
        echo "✅ All dependencies check passed!"
    fi
fi

# Extra patch for noise-handler.js if needed (fallback approach)
if [ -f "scripts/fixed-noise-handler.js" ] && [ -f "node_modules/@whiskeysockets/baileys/lib/Utils/noise-handler.js" ]; then
    echo "🔧 Applying fixed noise handler implementation..."
    cp scripts/fixed-noise-handler.js node_modules/@whiskeysockets/baileys/lib/Utils/noise-handler.js
    echo "✅ Applied fixed noise-handler.js"
fi

echo "🚀 Starting DarkHeart WhatsApp Bot..."

# Start the bot using node with full error display
NODE_OPTIONS="--trace-warnings" node index.js
