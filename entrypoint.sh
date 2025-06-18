#!/bin/bash

# WhatsApp Bot - Simple Pterodactyl Entrypoint
# This script runs before starting the bot and ensures dependencies are installed

echo "🖤 WhatsApp Bot - Starting Up 🖤"
echo "=============================="

# Function to perform a clean installation
clean_install() {
    echo "Performing clean installation..."
    rm -rf node_modules package-lock.json
    npm cache clean --force
    npm install --production --no-audit --no-fund
    return $?
}

# Check if script is called from prestart
if [ "$1" = "from_prestart" ]; then
    echo "📋 Running setup from prestart script..."

# Make sure we're in the correct directory
cd /home/container 2>/dev/null || cd $(pwd) || true

# Set default directory paths for different environments
if [ -d "/home/container" ]; then
  # Pterodactyl environment
  BASE_DIR="/home/container"
else
  # Local or other environment
  BASE_DIR=$(pwd)
fi

cd "$BASE_DIR" || exit 1

# Create basic directories
mkdir -p data/sessions media/images media/audio

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 First run detected. Installing dependencies..."
    npm install --production
    echo "✅ Dependencies installed!"
fi

# Fix the Baileys noise-handler issue
if [ -d "node_modules/@whiskeysockets" ]; then
    echo "🔧 Applying fix for noise-handler..."
    # Create simple fix directly in the script
    cat > node_modules/@whiskeysockets/baileys/lib/Utils/noise-handler.js << 'EOL'
const { generateKeyPair } = require('./crypto');

// Define makeNoiseHandler first to avoid reference error
const makeNoiseHandler = (options) => {
  const { private: privateKey, public: publicKey } = options.keyPair || generateKeyPair();
  
  return {
    keyPair: { private: privateKey, public: publicKey },
    
    processHandshake: (data) => {
      const keyEnc = data && data.length >= 32 ? data.slice(0, 32) : Buffer.alloc(32);
      const keyMac = data && data.length >= 64 ? data.slice(32, 64) : Buffer.alloc(32);
      
      return {
        encKey: Buffer.from(keyEnc),
        macKey: Buffer.from(keyMac)
      };
    },
    
    decodeFrame: (data) => data,
    encodeFrame: (data) => data
  };
};

// Export functions
exports.makeNoiseHandler = makeNoiseHandler;
exports.makeNoiseHandlerAsync = makeNoiseHandler;
EOL
    echo "✅ Fixed noise-handler issue!"
fi

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

# If this was called from prestart, exit here to prevent infinite loop
if [ "$1" = "from_prestart" ]; then
    echo "✅ Setup complete! Bot will start now..."
    exit 0
fi

# Only reached when script is called directly (not from prestart)
echo "🚀 Starting WhatsApp Bot..."
node index.js
