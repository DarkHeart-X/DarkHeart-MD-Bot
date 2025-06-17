// DarkHeart Bot Settings & Configuration
// All bot settings are managed from this file

const settings = {
    // Bot Basic Information
    botInfo: {
        name: "DarkHeart Bot",
        version: "1.0.0",
        author: "DarkHeart Team",
        description: "Advanced WhatsApp Bot with Multiple Features",
        library: "Baileys (WhatsApp Web API)",
        created: "June 2025"
    },

    // Bot Configuration
    config: {
        prefix: "!",
        owner: "923xxxxxxxxx@s.whatsapp.net", // Replace with your WhatsApp number
        timezone: "Asia/Karachi", // Your timezone
        language: "en", // Bot language
        autoRead: false, // Auto read messages
        autoTyping: true, // Show typing indicator
        maxMessageLength: 4096 // Max message length
    },

    // Messages Configuration
    messages: {
        welcome: "🖤 Welcome to DarkHeart Bot! 🖤",
        botOnline: "🖤 DarkHeart Bot is now Online! 🖤",
        botOffline: "🖤 DarkHeart Bot is going Offline! 🖤",
        unknownCommand: "❌ Unknown command! Type *{prefix}menu* for available commands.",
        accessDenied: "🚫 Access denied! This command is for admins only.",
        processing: "⚡ Processing your request...",
        error: "❌ An error occurred while processing your request."
    },

    // Menu Categories
    menuCategories: {
        general: {
            title: "🔧 General Commands",
            description: "Basic bot commands for everyone",
            emoji: "🔧"
        },
        fun: {
            title: "🎉 Fun Commands", 
            description: "Entertainment and fun features",
            emoji: "🎉"
        },
        utility: {
            title: "⚡ Utility Commands",
            description: "Useful tools and utilities", 
            emoji: "⚡"
        },
        admin: {
            title: "👑 Admin Commands",
            description: "Commands for bot administrators",
            emoji: "👑"
        }
    },

    // Commands List
    commands: {
        // General Commands
        menu: {
            category: "general",
            description: "Show complete bot menu",
            usage: "!menu",
            aliases: ["help", "commands"]
        },
        ping: {
            category: "general", 
            description: "Check bot response time",
            usage: "!ping",
            aliases: ["pong"]
        },
        info: {
            category: "general",
            description: "Show bot information",
            usage: "!info",
            aliases: ["about", "botinfo"]
        },
        time: {
            category: "utility",
            description: "Show current date and time",
            usage: "!time",
            aliases: ["date", "clock"]
        },
        quote: {
            category: "fun",
            description: "Get random motivational quote",
            usage: "!quote", 
            aliases: ["quotes", "motivation"]
        },
        joke: {
            category: "fun",
            description: "Get a random joke",
            usage: "!joke",
            aliases: ["jokes", "funny"]
        },
        weather: {
            category: "utility",
            description: "Get weather information",
            usage: "!weather <city>",
            aliases: ["clima"]
        },        calculator: {
            category: "utility",
            description: "Perform mathematical calculations", 
            usage: "!calc <expression>",
            aliases: ["calculate", "math"]
        },
        // Advanced Features Commands
        antidelete: {
            category: "admin",
            description: "Toggle anti-delete messages",
            usage: "!antidelete on/off",
            aliases: []
        },
        antilink: {
            category: "admin", 
            description: "Toggle anti-link protection",
            usage: "!antilink on/off",
            aliases: []
        },
        autoreact: {
            category: "admin",
            description: "Toggle auto reactions",
            usage: "!autoreact on/off", 
            aliases: []
        },
        customemoji: {
            category: "admin",
            description: "Set custom reaction emoji",
            usage: "!customemoji <emoji>",
            aliases: []
        },
        antiviewonce: {
            category: "admin",
            description: "Toggle anti-view once",
            usage: "!antiviewonce on/off",
            aliases: []
        },
        savestatus: {
            category: "admin",
            description: "Toggle status saving",
            usage: "!savestatus on/off",
            aliases: []
        },
        autoviewstatus: {
            category: "admin",
            description: "Toggle auto status viewing",
            usage: "!autoviewstatus on/off", 
            aliases: []
        },
        autostatusreact: {
            category: "admin",
            description: "Toggle auto status reactions",
            usage: "!autostatusreact on/off",
            aliases: []
        },
        statusreactemoji: {
            category: "admin",
            description: "Set status reaction emoji",
            usage: "!statusreactemoji <emoji>",
            aliases: []
        },        settings: {
            category: "admin",
            description: "Show advanced settings",
            usage: "!settings",
            aliases: []
        },        session: {
            category: "admin",
            description: "Show session information",
            usage: "!session",
            aliases: ["sessioninfo"]
        },        setup: {
            category: "admin",
            description: "Show first-time setup guide",
            usage: "!setup",
            aliases: ["firstsetup"]
        },
        cleanup: {
            category: "admin",
            description: "Manual cleanup of old messages (24h+)",
            usage: "!cleanup",
            aliases: ["clean", "clear"]
        },
        cleanupstats: {
            category: "admin",
            description: "Show cleanup statistics",
            usage: "!cleanupstats",
            aliases: ["stats"]
        }
    },

    // Bot Quotes
    quotes: [
        "The only way to do great work is to love what you do. - Steve Jobs",
        "Life is what happens to you while you're busy making other plans. - John Lennon", 
        "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
        "It is during our darkest moments that we must focus to see the light. - Aristotle",
        "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
        "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
        "The way to get started is to quit talking and begin doing. - Walt Disney",
        "Innovation distinguishes between a leader and a follower. - Steve Jobs",
        "Your limitation—it's only your imagination.",
        "Push yourself, because no one else is going to do it for you.",
        "Great things never come from comfort zones.",
        "Dream it. Wish it. Do it.",
        "Success doesn't just find you. You have to go out and get it.",
        "The harder you work for something, the greater you'll feel when you achieve it.",
        "Don't stop when you're tired. Stop when you're done."
    ],

    // Bot Jokes
    jokes: [
        "Why don't scientists trust atoms? Because they make up everything! 😄",
        "Why did the scarecrow win an award? He was outstanding in his field! 🌾",
        "Why don't eggs tell jokes? They'd crack each other up! 🥚",
        "What do you call a fake noodle? An impasta! 🍝",
        "Why did the math book look so sad? Because of all of its problems! 📚",
        "What do you call a bear with no teeth? A gummy bear! 🐻",
        "Why can't a bicycle stand up by itself? It's two tired! 🚲",
        "What do you call a fish wearing a bowtie? Sofishticated! 🐟",
        "Why did the cookie go to the doctor? Because it felt crumbly! 🍪",
        "What's orange and sounds like a parrot? A carrot! 🥕"
    ],

    // Group Settings
    groupSettings: {
        autoWelcome: true,
        autoGoodbye: true,
        antiLink: false,
        autoKick: false,
        onlyAdmins: false,
        muteAll: false
    },

    // Bot Features
    features: {
        multiDevice: true,
        autoResponse: true,
        commandLogging: true,
        errorHandling: true,
        groupManagement: true,
        mediaDownload: true,
        customCommands: true,
        apiIntegration: true
    },

    // API Keys (Add your API keys here)
    apiKeys: {
        weather: "your_weather_api_key", // OpenWeatherMap API key
        translate: "your_translate_api_key", // Google Translate API key
        news: "your_news_api_key" // News API key
    },

    // Admin Settings
    adminSettings: {
        ownerOnly: ["restart", "shutdown", "eval", "exec"],
        adminOnly: ["kick", "ban", "mute", "unmute", "promote", "demote"],
        cooldown: 3000, // Command cooldown in milliseconds
        maxWarnings: 3,
        autoMod: false
    }
};

module.exports = settings;
