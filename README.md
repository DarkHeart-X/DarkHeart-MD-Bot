# WhatsApp Bot

A powerful WhatsApp bot built with Baileys library for Node.js, ready for cloud deployment

## Features ✨

- 🤖 **24/7 Online** - Always active and ready to respond
- ⚡ **Fast Response** - Lightning-fast command processing
- 🎯 **Advanced Menu System** - Categorized commands with aliases
- 👥 **Group Management** - Auto welcome messages for new members
- 🔒 **Multi-Device Support** - Works without keeping phone online
- 📱 **Easy Setup** - Simple installation and configuration
- ☁️ **Cloud Ready** - Deploy on Heroku, Railway, Render, or Panel
- 🧮 **Calculator** - Mathematical calculations
- 😂 **Fun Commands** - Jokes, quotes, and entertainment
- 📁 **Organized Structure** - Modular file organization
- 🚀 **Easy Deployment** - Auto-installs dependencies on start

## Installation 🚀

1. **Clone or download** this project to your local machine

2. **Install Node.js** (if not already installed)
   - Download from: https://nodejs.org/

3. **Install dependencies**:
   ```bash
   npm install
   ```
   
   Or use the provided script:
   ```bash
   # On Windows
   install.bat
   
   # On Linux/Mac
   bash entrypoint.sh
   ```

4. **Configure the bot**:
   - Open `index.js`
   - Replace `owner` number with your WhatsApp number
   - Customize bot settings as needed

5. **Run the bot**:
   ```bash
   npm start
   ```

6. **Scan QR Code**:
   - A QR code will appear in terminal
   - Scan it with your WhatsApp (Linked Devices)

## Commands 📋

| Command | Description |
|---------|-------------|
| `!help` | Show all available commands |
| `!ping` | Check bot response time |
| `!info` | Display bot information |
| `!time` | Show current date and time |
| `!quote` | Get a random motivational quote |

## Configuration ⚙️

Edit the `config` object in `index.js`:

```javascript
const config = {
    botName: "DarkHeart Bot",
    prefix: "!",
    owner: "923xxxxxxxxx@s.whatsapp.net", // Your WhatsApp number
    welcomeMessage: "🖤 Welcome to DarkHeart Bot! 🖤"
};
```

## Deployment Options 🌐

### Panel Deployment 🚀

For a simple panel deployment:

1. **Create a new server** on your panel using NodeJS
2. **Upload files** to the server using File Manager
3. **Set the startup command** to: `npm start`
4. **Start the server** - dependencies will install automatically
5. **Scan QR code** from the console or use pairing code

The bot will automatically:
- Install dependencies if missing
- Fix any library issues
- Create necessary directories
- Start and run properly

For detailed instructions, see:
- 📄 [Panel Deployment Guide](SIMPLE_PTERODACTYL_GUIDE.md)

### Other Cloud Platforms ☁️

You can also deploy the bot on:

- **Heroku**: Use the `Procfile` included in the repo
- **Railway**: Auto-deploy from GitHub
- **Render**: Use the included `deploy.sh` script
- **VPS**: Run directly with Node.js

For detailed cloud deployment instructions:
- 📄 [Deployment Guide](public/docs/DEPLOYMENT_GUIDE.md)

## File Structure 📁

```
whatsapp bot/
├── index.js              # Main bot file
├── package.json          # Dependencies and scripts
├── config.js             # Configuration settings
├── settings.js           # Bot settings and commands
├── commandHandler.js     # Command processing
├── entrypoint.sh         # Entry script with auto-fixes
├── Dockerfile            # Docker container definition
├── README.md             # This file
├── lib/                  # Library modules
├── data/                 # Data storage (auto-created)
├── media/                # Media files (auto-created)
├── public/               # Public files and documentation
│   └── docs/             # Documentation files
└── scripts/              # Utility scripts
```

## Scripts 📝

- `npm start` - Start the bot
- `npm run dev` - Start with auto-restart (nodemon)

## Requirements 📋

- Node.js v16 or higher
- Stable internet connection
- WhatsApp account

## Troubleshooting 🔧

### Common Issues:

1. **QR Code not scanning**:
   - Make sure WhatsApp is updated
   - Try refreshing the QR code

2. **Connection issues**:
   - Check internet connection
   - Restart the bot

3. **Commands not working**:
   - Ensure correct prefix (!)
   - Check for typos

## Adding New Commands 🛠️

To add a new command, edit the switch statement in `index.js`:

```javascript
case 'newcommand':
    await sock.sendMessage(from, { 
        text: 'Your response here' 
    });
    break;
```

## Security 🔒

- Never share your `auth_info_baileys` folder
- Keep your bot code private
- Use environment variables for sensitive data

## Support 💬

For issues and questions:
- Check the console for error messages
- Ensure all dependencies are installed
- Verify your Node.js version

## License 📄

This project is licensed under the MIT License.

---

**🖤 DarkHeart Bot - Powered by NAWABZAADAA 🖤**

*Happy botting! 🚀*
