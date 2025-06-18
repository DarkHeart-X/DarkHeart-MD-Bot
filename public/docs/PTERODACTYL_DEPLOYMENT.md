# 🦅 DarkHeart WhatsApp Bot - Pterodactyl Deployment Guide

This guide will help you deploy the DarkHeart WhatsApp Bot on a Pterodactyl Panel server.

## 📋 Prerequisites

- A server running Pterodactyl Panel
- Access to create and manage servers on your Pterodactyl Panel
- Basic understanding of Docker and Pterodactyl configuration

## 🔧 Step 1: Create a New Server on Pterodactyl

1. Log in to your Pterodactyl Panel admin area
2. Navigate to **Servers** → **Create New**
3. Fill in the required details:
   - **Name**: DarkHeart WhatsApp Bot
   - **Owner**: Select the appropriate user
   - **Nest**: Select "NodeJS" (or create a custom egg)
   - **Egg**: Select "NodeJS Generic" or use our custom egg (see below)

## 🥚 Step 2: Using a Custom Egg (Optional but Recommended)

For optimal performance, you can create a custom egg for the DarkHeart WhatsApp Bot:

1. Navigate to **Admin** → **Nests** → Select "NodeJS" nest
2. Click **Create New Egg**
3. Fill in the details:
   - **Name**: DarkHeart WhatsApp Bot
   - **Description**: WhatsApp Bot using Baileys library
   - **Docker Image**: `ghcr.io/pterodactyl/yolks:nodejs_18`
4. In the **Startup** tab, set:
   - **Startup Command**: `bash entrypoint.sh`
5. Save the egg and import the necessary variables

## 🚀 Step 3: Deploy the Bot

### Method 1: Direct Upload

1. Upload all your bot files to the server using the Pterodactyl file manager
2. Make sure to upload all necessary files including:
   - All JavaScript files
   - package.json
   - entrypoint.sh
   - All configuration files

### Method 2: Git Deployment

1. In the Pterodactyl console, run:
   ```bash
   git clone https://your-git-repository-url.git ./
   ```
2. Make sure `entrypoint.sh` has executable permissions:
   ```bash
   chmod +x entrypoint.sh
   ```

## ⚙️ Step 4: Configuration

1. Create a `.env` file with your configuration:
   ```
   BOT_NAME=DarkHeart
   OWNER_NUMBER=your-number
   # Other configuration variables
   ```

2. Start the server from the Pterodactyl panel

## 🔄 Startup Process Explanation

When your server starts:

1. The `entrypoint.sh` script runs automatically
2. It checks if `node_modules` exists and installs dependencies if needed
3. It creates all required directories using `scripts/create-directories.js`
4. The bot starts with `node index.js`

## 🛠️ Troubleshooting

### Bot fails to start

Check logs for errors. Common issues:

- **Missing dependencies**: The `entrypoint.sh` should handle this, but check if NPM is working properly
- **Permission issues**: Make sure `entrypoint.sh` is executable
- **Missing directories**: Verify the `create-directories.js` script ran successfully

### "undefined at makeNoiseHandler" Error

This is a known issue with the Baileys library in some environments. The bot includes an automatic fix:

1. If you see this error, the bot will automatically try to fix it on the next restart
2. You can manually fix it by running these commands in the Pterodactyl console:

```bash
# Apply the Baileys patch
node scripts/patch-baileys.js

# Verify the fix worked
node scripts/check-dependencies.js

# Restart the server
```

If that doesn't work, try a clean reinstall:

```bash
# Remove node_modules
rm -rf node_modules

# Clean npm cache
npm cache clean --force

# Reinstall with forced clean install
npm ci --force

# Apply patches
node scripts/patch-baileys.js

# Start the server
bash entrypoint.sh
```

### WhatsApp connection issues

- Check if the QR code is being generated correctly
- If using pairing code, ensure you've entered the correct phone number
- Try restarting the server to get a fresh connection

## 🔁 Updating the Bot

To update your bot:

1. Stop the server from the Pterodactyl panel
2. Upload the new files or pull changes from git
3. Start the server again

## 📊 Resource Allocation Recommendations

For optimal performance:

- **Memory**: At least 512MB, recommended 1GB
- **CPU**: At least 100%, recommended 200%
- **Disk**: At least 1GB, recommended 2GB for media storage

## 🔒 Persistent Storage

For persistent storage between container restarts:

1. Create mount points in your Pterodactyl Panel
2. Mount the following directories:
   - `/home/container/data` → persistent data storage
   - `/home/container/media` → persistent media storage

This ensures your session data and media files aren't lost when the container restarts.
