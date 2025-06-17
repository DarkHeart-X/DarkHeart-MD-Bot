#!/usr/bin/env bash

# DarkHeart Bot - Cloud Deployment Script
# This script helps deploy the bot to various cloud platforms

echo "🖤 DarkHeart Bot - Cloud Deployment Helper 🖤"
echo "=============================================="

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - DarkHeart Bot"
    echo "✅ Git repository initialized"
fi

echo ""
echo "🚀 Select deployment platform:"
echo "1) Heroku"
echo "2) Railway"
echo "3) Render"
echo "4) Manual Git Setup"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "🔵 Setting up for Heroku deployment..."
        
        # Check if Heroku CLI is installed
        if ! command -v heroku &> /dev/null; then
            echo "❌ Heroku CLI is not installed."
            echo "📥 Please install it from: https://devcenter.heroku.com/articles/heroku-cli"
            exit 1
        fi
        
        read -p "Enter your Heroku app name: " app_name
        
        # Create Heroku app
        heroku create $app_name
        
        # Set config vars
        echo "⚙️ Setting up environment variables..."
        heroku config:set NODE_ENV=production --app $app_name
        heroku config:set BOT_PREFIX=! --app $app_name
        
        read -p "Enter your WhatsApp number (with country code): " owner_number
        heroku config:set OWNER_NUMBER=$owner_number --app $app_name
        
        # Deploy
        echo "🚀 Deploying to Heroku..."
        git add .
        git commit -m "Deploy to Heroku"
        git push heroku main
        
        echo "✅ Deployed to Heroku! Check: https://$app_name.herokuapp.com"
        ;;
        
    2)
        echo "🟣 Setting up for Railway deployment..."
        echo "1. Go to https://railway.app"
        echo "2. Connect your GitHub account"
        echo "3. Import this repository"
        echo "4. Set environment variables in Railway dashboard"
        echo "5. Deploy automatically!"
        
        # Create railway.json for Railway
        cat > railway.json << EOF
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF
        
        git add railway.json
        git commit -m "Add Railway configuration"
        echo "✅ Railway configuration added!"
        ;;
        
    3)
        echo "🟢 Setting up for Render deployment..."
        echo "1. Go to https://render.com"
        echo "2. Connect your GitHub account"
        echo "3. Create new Web Service"
        echo "4. Select this repository"
        echo "5. Set build command: npm install"
        echo "6. Set start command: npm start"
        echo "7. Add environment variables"
        echo "8. Deploy!"
        
        # Create render.yaml
        cat > render.yaml << EOF
services:
  - type: web
    name: darkheart-bot
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: BOT_PREFIX
        value: "!"
EOF
        
        git add render.yaml
        git commit -m "Add Render configuration"
        echo "✅ Render configuration added!"
        ;;
        
    4)
        echo "📝 Manual Git Setup..."
        echo "Repository is ready for manual deployment."
        echo "Make sure to:"
        echo "1. Set environment variables on your platform"
        echo "2. Use 'npm start' as start command"
        echo "3. Set Node.js version to 18+ if required"
        
        git add .
        git commit -m "Ready for deployment"
        echo "✅ Git repository prepared!"
        ;;
        
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🖤 Deployment setup complete! 🖤"
echo "📚 Check README.md for detailed deployment instructions."
echo "🐛 If you encounter issues, check the logs on your platform."
