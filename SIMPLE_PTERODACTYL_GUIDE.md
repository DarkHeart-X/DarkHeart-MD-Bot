# 🖤 WhatsApp Bot - Simple Pterodactyl Deployment Guide

This guide provides straightforward instructions for deploying a WhatsApp Bot on a Pterodactyl panel without any startup loops.

## Quick Setup Instructions

### 1. Create a New Server in Pterodactyl

1. Go to your Pterodactyl panel
2. Create a new server with the NodeJS egg
3. Set appropriate resources (512MB RAM minimum recommended)

### 2. Upload the Bot Files

1. Upload all bot files to the server using Pterodactyl's file manager
2. Make sure to include all files, especially:
   - `index.js`
   - `package.json`
   - `entrypoint.sh`

### 3. Configure the Startup Command

1. In the Pterodactyl panel, go to the server's "Startup" tab
2. Ensure the startup command is set to: `npm start`
3. Add these environment variables (recommended):
   - `OWNER_NUMBER`: Your WhatsApp number (e.g., `923001234567`)
   - Note: Pairing code is enabled by default
4. Save the changes

### 4. Start the Server

1. Click the "Start" button in Pterodactyl
2. The bot will automatically:
   - Install dependencies
   - Fix the Baileys noise-handler issue
   - Create necessary directories
   - Start the WhatsApp bot

### 5. Scan QR Code or Enter Pairing Code

1. Once started, check the console for the QR code or pairing code prompt
2. Follow the instructions to connect your WhatsApp

## Troubleshooting

### If the bot fails to start

Try these commands in the Pterodactyl console:

```bash
# Reinstall dependencies
rm -rf node_modules
npm install --production

# Fix the noise-handler issue
cp scripts/simple-noise-handler-fix.js node_modules/@whiskeysockets/baileys/lib/Utils/noise-handler.js

# Start the bot again
node index.js
```

### If you see Baileys errors (noise-handler or WebSocket errors)

If you see these specific errors:
- `TypeError: Cannot read properties of undefined (reading 'error')` at socket.js:454:20
- `TypeError: Cannot read properties of undefined (reading 'info')` at socket.js:254:16

Run this direct fix:

```bash
# Quick fix for WebSocket errors (recommended)
node scripts/fix-websocket-errors.js
```

For a complete fix of all common Baileys issues:

```bash
# Run the comprehensive fix script
bash scripts/fix-baileys.sh
```

If you still have issues, try these targeted fixes:

```bash
# For WebSocket errors shown in your screenshot
bash scripts/fix-socket.sh

# For noise-handler errors only
cp scripts/simple-noise-handler-fix.js node_modules/@whiskeysockets/baileys/lib/Utils/noise-handler.js
```

If that doesn't work, you can edit the file directly:

```bash
# Edit the noise-handler.js file manually
nano node_modules/@whiskeysockets/baileys/lib/Utils/noise-handler.js
```

Delete everything and paste this more robust implementation:

```javascript
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
```

Save the file and restart the bot.

## Updating the Bot

To update your bot:

1. Stop the server
2. Upload the updated files
3. Start the server again

## Advanced Configuration

### Working with Custom Eggs

If you're using the provided custom egg (pterodactyl-egg.json or simple-egg.json):

1. Import the egg into your Pterodactyl panel
2. When creating the server, select the imported egg
3. Configure the environment variables when prompted

### Potential Startup Issues

If you're experiencing issues with startup:

1. Check if your server is using the correct startup command
   - In your server's "Startup" tab, it should be set to `npm start`
   - If it's set to `bash entrypoint.sh`, change it to `npm start` for better reliability

2. Verify file permissions
   - Make sure `entrypoint.sh` is executable
   - Run this in the console if needed: `chmod +x entrypoint.sh`

3. If you encounter permission errors:
   - Try running: `chmod -R 755 .`

The automatic dependency installation will only run if the `node_modules` folder is missing, so updates will be quick.
