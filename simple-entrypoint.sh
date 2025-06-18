#!/bin/bash
# Super simple entrypoint script for Pterodactyl

echo "🖤 DarkHeart WhatsApp Bot - Simple Setup 🖤"
echo "=========================================="

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

# Start the bot
echo "🚀 Starting DarkHeart WhatsApp Bot..."
node index.js
