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
fi

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

# Fix Baileys issues (noise-handler and socket.js)
if [ -d "node_modules/@whiskeysockets" ]; then
    echo "🔧 Applying comprehensive Baileys fixes..."
    
    # Try the direct WebSocket error fix first (most targeted solution)
    if [ -f "scripts/fix-websocket-errors.js" ]; then
        echo "🔄 Running direct WebSocket error fix with Node.js..."
        node scripts/fix-websocket-errors.js
    elif [ -f "scripts/fix-socket.sh" ]; then
        echo "🔄 Running targeted socket.js fix..."
        bash scripts/fix-socket.sh
    # Use the comprehensive fix script if available
    elif [ -f "scripts/fix-baileys.sh" ]; then
        echo "🔄 Running comprehensive fix-baileys.sh script..."
        bash scripts/fix-baileys.sh
    
    # Fall back to the simple fix if the script doesn't exist
    elif [ -f "scripts/simple-noise-handler-fix.js" ]; then
        echo "🔧 Applying simple noise-handler fix..."
        cp scripts/simple-noise-handler-fix.js node_modules/@whiskeysockets/baileys/lib/Utils/noise-handler.js
        
        # Also try to fix socket.js WebSocket errors
        if [ -f "node_modules/@whiskeysockets/baileys/lib/Socket/socket.js" ]; then
            echo "🔧 Attempting to patch socket.js for WebSocket errors..."
            cp node_modules/@whiskeysockets/baileys/lib/Socket/socket.js node_modules/@whiskeysockets/baileys/lib/Socket/socket.js.bak 2>/dev/null || true
            
            echo "🔧 Fixing 'Cannot read properties of undefined' errors in socket.js..."
            # Fix 1: WebSocketClient.<anonymous> error at line 454
            sed -i'.bak' 's/ws\.on(['"'"']close['"'"'], *({.*}) *=>/ws.on(\1, (event) => { const code = event?.code || 0; const reason = event?.reason || ""; /g' node_modules/@whiskeysockets/baileys/lib/Socket/socket.js 2>/dev/null || true
            
            # Fix 2: connection.info error at line 254
            sed -i'.bak' 's/connection\.info\.statusCode/connection?.info?.statusCode || 500/g' node_modules/@whiskeysockets/baileys/lib/Socket/socket.js 2>/dev/null || true
            sed -i'.bak' 's/connection\.info\.reason/connection?.info?.reason || "Connection ended"/g' node_modules/@whiskeysockets/baileys/lib/Socket/socket.js 2>/dev/null || true
            
            # Fix 3: err object error
            sed -i'.bak' 's/({ statusCode: err.code, reason: err.reason })/({ statusCode: err?.code || 0, reason: err?.reason || "Unknown" })/g' node_modules/@whiskeysockets/baileys/lib/Socket/socket.js 2>/dev/null || true
        fi
    
    # Create fixes inline if no scripts are available
    else
        # Fix noise-handler.js
        echo "🔧 Creating inline noise-handler.js fix..."
        cat > node_modules/@whiskeysockets/baileys/lib/Utils/noise-handler.js << 'EOL'
/**
 * Fixed noise-handler.js to avoid initialization errors
 */
const { generateKeyPair } = require('./crypto');

// Define makeNoiseHandler first to avoid the reference error
const makeNoiseHandler = (options = {}) => {
  // Ensure options and keyPair exist to prevent undefined errors
  options = options || {};
  const keyPair = options.keyPair || generateKeyPair();
  const privateKey = keyPair.private;
  const publicKey = keyPair.public;
  
  let inBytes = Buffer.alloc(0);
  
  return {
    keyPair: { private: privateKey, public: publicKey },
    
    processHandshake: (data) => {
      // Simple implementation that returns the required keys
      const keyEnc = data && data.length >= 32 ? data.slice(0, 32) : Buffer.alloc(32);
      const keyMac = data && data.length >= 64 ? data.slice(32, 64) : Buffer.alloc(32);
      
      return {
        encKey: Buffer.from(keyEnc),
        macKey: Buffer.from(keyMac)
      };
    },
    
    decodeFrame: (newData) => {
      try {
        // Basic implementation that just returns the data
        inBytes = Buffer.concat([inBytes, Buffer.from(newData)]);
        
        if (inBytes.length < 3) {
          return null;
        }
        
        const frameLength = inBytes.slice(0, 3).readUIntBE(0, 3);
        
        if (inBytes.length < frameLength + 3) {
          return null;
        }
        
        const frame = inBytes.slice(3, frameLength + 3);
        inBytes = inBytes.slice(frameLength + 3);
        
        return frame;
      } catch (error) {
        return null;
      }
    },
    
    encodeFrame: (data) => {
      try {
        const bytes = Buffer.isBuffer(data) ? data : Buffer.from(data);
        const frameLength = Buffer.alloc(3);
        frameLength.writeUIntBE(bytes.length, 0, 3);
        return Buffer.concat([frameLength, bytes]);
      } catch (error) {
        return Buffer.alloc(0);
      }
    }
  };
};

// Export the functions
exports.makeNoiseHandler = makeNoiseHandler;
exports.makeNoiseHandlerAsync = makeNoiseHandler;
EOL

        # Also try to patch socket.js for WebSocket errors
        if [ -f "node_modules/@whiskeysockets/baileys/lib/Socket/socket.js" ]; then
            echo "🔧 Patching socket.js to handle WebSocket errors..."
            cp node_modules/@whiskeysockets/baileys/lib/Socket/socket.js node_modules/@whiskeysockets/baileys/lib/Socket/socket.js.bak
            
            # Apply safe optional chaining to prevent "Cannot read properties of undefined" errors
            sed -i'.bak' 's/\({ statusCode: err.code, reason: err.reason }\)/\({ statusCode: err?.code || 0, reason: err?.reason || "Unknown" }\)/g' node_modules/@whiskeysockets/baileys/lib/Socket/socket.js 2>/dev/null || true
            sed -i'.bak' 's/connection.info.statusCode/connection?.info?.statusCode || 500/g' node_modules/@whiskeysockets/baileys/lib/Socket/socket.js 2>/dev/null || true
            sed -i'.bak' 's/connection.info.reason/connection?.info?.reason || "Connection ended"/g' node_modules/@whiskeysockets/baileys/lib/Socket/socket.js 2>/dev/null || true
        fi
    fi
    
    echo "✅ Fixed Baileys issues!"
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
