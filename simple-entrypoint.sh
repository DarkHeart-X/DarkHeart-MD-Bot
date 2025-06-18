#!/bin/bash
# Super simple entrypoint script for Pterodactyl

echo "🖤 DarkHeart WhatsApp Bot - Simple Setup 🖤"
echo "=========================================="

# Check if script is called from prestart
if [ "$1" = "from_prestart" ]; then
    echo "📋 Running setup from prestart script..."

# Create directories if they don't exist
mkdir -p data/sessions media/images media/audio

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --production
    echo "✅ Dependencies installed!"
fi

# Fix the Baileys noise-handler issue
if [ -f "node_modules/@whiskeysockets/baileys/lib/Utils/noise-handler.js" ]; then
    echo "🔧 Applying simple fix for noise-handler..."
    cp scripts/simple-noise-handler-fix.js node_modules/@whiskeysockets/baileys/lib/Utils/noise-handler.js
    echo "✅ Fixed noise-handler issue!"
fi

# If this was called from prestart, exit here to prevent infinite loop
if [ "$1" = "from_prestart" ]; then
    echo "✅ Setup complete! Bot will start now..."
    exit 0
fi

# Only reached when script is called directly (not from prestart)
echo "🚀 Starting DarkHeart WhatsApp Bot..."
node index.js
