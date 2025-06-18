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
3. Add these environment variables (optional but recommended):
   - `USE_PAIRING_CODE`: `true`
   - `OWNER_NUMBER`: Your WhatsApp number (e.g., `923001234567`)
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

### If you still see the noise-handler error

```bash
# Edit the noise-handler.js file directly
nano node_modules/@whiskeysockets/baileys/lib/Utils/noise-handler.js
```

Then delete everything and paste this simple implementation:

```javascript
const { generateKeyPair } = require('./crypto');

// Define function first to avoid reference error
const makeNoiseHandler = (options) => {
  return {
    processHandshake: () => ({
      encKey: Buffer.alloc(32),
      macKey: Buffer.alloc(32)
    }),
    decodeFrame: (data) => data,
    encodeFrame: (data) => data
  };
};

// Export functions
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
