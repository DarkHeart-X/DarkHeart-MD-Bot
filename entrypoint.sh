#!/bin/bash

# DarkHeart WhatsApp Bot - Pterodactyl Panel Entrypoint
# This script runs before starting the bot and ensures dependencies are installed

# Ensure script is executable
if [ "$(id -u)" != "0" ] && [ -f "entrypoint.sh" ]; then
    chmod +x entrypoint.sh
fi

echo "🖤 DarkHeart Bot - Pterodactyl Setup 🖤"
echo "======================================"

# Check if node_modules exists and install if missing
if [ ! -d "node_modules" ] || [ ! "$(ls -A node_modules 2>/dev/null)" ]; then
    echo "📦 node_modules missing or empty. Installing dependencies..."
    npm install --no-audit --no-fund
    
    # Check if installation succeeded
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies. Please check your package.json and internet connection."
        exit 1
    fi
    
    echo "✅ Dependencies installed successfully!"
else
    echo "✅ Dependencies already installed!"
fi

# Create necessary directories
echo "📁 Ensuring required directories exist..."
node scripts/create-directories.js

echo "🚀 Starting DarkHeart WhatsApp Bot..."

# Start the bot using node
node index.js
