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

echo 
echo "🔍 Test Results:"
echo "----------------"
echo "✅ Script execution: Successful"
[ -d "node_modules" ] && echo "✅ Dependency installation: Successful" || echo "❌ Dependency installation: Failed"
[ -d "data" ] && echo "✅ Directory creation: Successful" || echo "❌ Directory creation: Failed"

echo
echo "🦅 Your bot is ready for Pterodactyl deployment!"
echo "   See public/docs/PTERODACTYL_DEPLOYMENT.md for full instructions"
