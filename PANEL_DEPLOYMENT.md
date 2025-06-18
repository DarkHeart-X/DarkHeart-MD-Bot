# WhatsApp Bot - Pterodactyl Panel Deployment Guide

This detailed guide will help you deploy the WhatsApp Bot on Pterodactyl panel and similar environments.

## 🔧 Deployment Steps

### 1. Create a New Server in Pterodactyl

1. Log in to your Pterodactyl panel
2. Click "Create Server" button
3. Select the "NodeJS" egg (or upload the custom `pterodactyl-egg.json` if available)
4. Configure server resources:
   - Memory: 512MB minimum (1GB recommended)
   - Disk: 1GB minimum
   - CPU: 100% minimum

### 2. Upload Bot Files

1. Upload all bot files to the server using Pterodactyl's file manager
   - You can upload as a zip and extract using the console
   - Or upload individual files
2. Ensure these essential files are included:
   - `index.js`
   - `package.json`
   - `entrypoint.sh`
   - All files in `lib/` directory

### 3. Configure Startup Command

1. Go to server "Startup" tab
2. Ensure the startup command is set to: `npm start`
3. Set these environment variables (optional):
   - `USE_PAIRING_CODE`: `true` (recommended)
   - `OWNER_NUMBER`: Your number in international format (e.g., `923001234567`)
4. Save the changes

### 4. Start the Server

1. Click the "Start" button in Pterodactyl
2. Watch the console for the setup process:
   - Dependencies will be installed automatically
   - The Baileys noise-handler issue will be fixed
   - Necessary directories will be created
   - The WhatsApp bot will start

### 5. Connect Your WhatsApp

If you set `USE_PAIRING_CODE=true` and provided your number, look for the pairing code in the console. It will look like:

```
🔐 Pairing Code: ABC-DEF-GHI
📱 Enter this code in WhatsApp > Linked Devices > Link a Device > Link with Phone Number
```

If no pairing code shows, or you didn't set the environment variables, scan the QR code.

## ⚠️ Troubleshooting

### Infinite Loop Issue

If you notice the bot repeatedly reinstalling dependencies in a loop, there may be an issue with the `entrypoint.sh` script:

1. Stop the server
2. Check `package.json` and ensure it has:
   ```json
   "scripts": {
     "prestart": "bash entrypoint.sh from_prestart || true",
     "start": "node index.js"
   }
   ```
3. Verify `entrypoint.sh` has the loop prevention code:
   ```bash
   # Check if script is called from prestart
   if [ "$1" = "from_prestart" ]; then
       echo "📋 Running setup from prestart script..."
       # ... setup code ...
       exit 0  # This prevents the loop!
   fi
   ```

### Missing Dependencies

If you see errors about missing modules:

1. In the Pterodactyl console, run:
   ```bash
   rm -rf node_modules
   npm install --production
   ```
2. Restart the server

### Baileys Noise-Handler Error

If you see errors related to `noise-handler.js`:

1. In the Pterodactyl console, run:
   ```bash
   bash scripts/patch-baileys.js
   ```
2. Or apply the fix manually:
   ```bash
   cp scripts/simple-noise-handler-fix.js node_modules/@whiskeysockets/baileys/lib/Utils/noise-handler.js
   ```

## 📝 Important Notes

1. The server will automatically install dependencies when starting
2. All necessary fixes are applied through the entrypoint script
3. No need to modify the startup command - everything runs through `npm start`
4. After successful pairing, the session will be saved for future restarts

## 🔄 Updating the Bot

To update your bot:

1. Stop the server from the Pterodactyl panel
2. Upload the new files via the File Manager
   - You can upload a zip file and extract it
   - Or update individual files as needed
3. Start the server again

## 🔧 Advanced Configuration

### Custom Egg Installation

If you want to use the provided custom egg:

1. Download the egg file from your bot files (either `pterodactyl-egg.json` or `simple-egg.json`)
2. In your Pterodactyl admin panel:
   - Go to Nests > Import Egg
   - Select the appropriate nest (usually the NodeJS nest)
   - Upload the egg file
3. Create a new server using the imported egg

### Environment Variables

You can set these environment variables for customization:

| Variable | Description | Example |
|----------|-------------|---------|
| `USE_PAIRING_CODE` | Enable pairing code auth | `true` |
| `OWNER_NUMBER` | Your WhatsApp number | `923001234567` |
| `BOT_NAME` | Custom bot name | `MyAwesomeBot` |
| `PREFIX` | Command prefix | `!` |

### Resolving Startup Command Conflicts

If your panel shows `bash entrypoint.sh` as the startup command instead of `npm start`:

1. Go to your server's "Startup" tab
2. Change the startup command to `npm start`
3. Save the changes
4. Restart your server

This ensures the bot uses the proper startup sequence with prestart handling.

For more detailed configuration options, refer to the main `README.md` file.
