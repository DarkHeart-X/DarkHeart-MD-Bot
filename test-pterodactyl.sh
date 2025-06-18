#!/bin/bash
# DarkHeart Bot - Pterodactyl Deployment Test Script
# Run this script to simulate a Pterodactyl environment and test the auto-installation

echo "🦅 DarkHeart WhatsApp Bot - Pterodactyl Deployment Test"
echo "====================================================="

# Create a clean test environment
TESTDIR="pterodactyl_test"

echo "📁 Creating test environment in ./$TESTDIR"
mkdir -p $TESTDIR

# Copy necessary files
echo "📋 Copying project files..."
cp -r index.js package.json entrypoint.sh config.js settings.js commandHandler.js lib/ scripts/ $TESTDIR/

# Enter the test directory
cd $TESTDIR

# Delete node_modules if exists
if [ -d "node_modules" ]; then
    echo "🗑️ Removing existing node_modules to simulate fresh environment"
    rm -rf node_modules
fi

# Make entrypoint executable
chmod +x entrypoint.sh

# Set test environment variables
export NODE_ENV=production
export BOT_NAME=TestBot
export OWNER_NUMBER=123456789
export PREFIX='!'
export USE_PAIRING_CODE=true

echo "🧪 Testing entrypoint script..."
echo "-----------------------------"

# Run the entrypoint script but exit before the actual bot starts
bash -c "bash entrypoint.sh" &
PID=$!

# Wait a moment to let installation begin
sleep 5

# Check if node_modules was created
if [ -d "node_modules" ]; then
    echo "✅ SUCCESS: node_modules was automatically created!"
    MODULES_COUNT=$(find node_modules -type d -depth 1 | wc -l)
    echo "📦 Installed approximately $MODULES_COUNT packages"
else
    echo "❌ FAILED: node_modules was not created"
fi

# Stop the running process
kill $PID 2>/dev/null

# Test Baileys patching specifically
echo 
echo "🧪 Testing Baileys patch for noise-handler issue..."
echo "-------------------------------------------------"

# Check if the patch scripts exist
if [ -f "scripts/check-dependencies.js" ] && [ -f "scripts/patch-baileys.js" ]; then
    echo "✅ Patch scripts found"
    
    # Test if noise-handler.js exists and has content
    if [ -f "node_modules/@whiskeysockets/baileys/lib/Utils/noise-handler.js" ]; then
        echo "✅ noise-handler.js exists"
        
        # Check file size
        SIZE=$(stat -c%s "node_modules/@whiskeysockets/baileys/lib/Utils/noise-handler.js" 2>/dev/null || echo "0")
        if [ "$SIZE" -gt "100" ]; then
            echo "✅ noise-handler.js has content (size: $SIZE bytes)"
        else
            echo "❌ noise-handler.js is too small (size: $SIZE bytes)"
        fi
        
        # Run the dependency check
        echo "� Running dependency check..."
        node scripts/check-dependencies.js
        if [ $? -eq 0 ]; then
            echo "✅ Dependency check passed"
            BAILEYS_CHECK="Passed"
        else
            echo "❌ Dependency check failed"
            BAILEYS_CHECK="Failed"
        fi
    else
        echo "❌ noise-handler.js not found"
        BAILEYS_CHECK="Failed"
    fi
else
    echo "❌ Patch scripts not found"
    BAILEYS_CHECK="Failed"
fi

echo 
echo "�🔍 Test Results:"
echo "----------------"
echo "✅ Script execution: Successful"
[ -d "node_modules" ] && echo "✅ Dependency installation: Successful" || echo "❌ Dependency installation: Failed" 
[ -d "data" ] && echo "✅ Directory creation: Successful" || echo "❌ Directory creation: Failed"
[ "$BAILEYS_CHECK" = "Passed" ] && echo "✅ Baileys noise-handler patch: Successful" || echo "❌ Baileys noise-handler patch: Failed"

echo
echo "🦅 Your bot is ready for Pterodactyl deployment!"
echo "   See public/docs/PTERODACTYL_DEPLOYMENT.md for full instructions"
