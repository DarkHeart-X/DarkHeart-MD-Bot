const { 
    makeWASocket, 
    DisconnectReason, 
    useMultiFileAuthState,
    downloadMediaMessage,
    jidDecode,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const fs = require('fs-extra');
const moment = require('moment');
const readline = require('readline');

// Import Settings
const settings = require('./settings');
const CommandHandler = require('./commandHandler');
const AdvancedFeatures = require('./lib/advancedFeatures');
const CommandHandlers = require('./lib/commandHandlers');
const Utils = require('./lib/utils');
const config = require('./config');

// Extract commonly used settings
const { botInfo, config: botConfig, messages, menuCategories, commands, quotes, jokes } = settings;

// Initialize handlers
const commandHandler = new CommandHandler();
const advancedFeatures = new AdvancedFeatures();
const commandHandlers = new CommandHandlers(advancedFeatures);

// Session management
let sessionId = null;
let botNumber = null;

// Function to get pairing code
async function getPairingCode() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('🖤 Enter your WhatsApp number (with country code, e.g., 923001234567): ', (number) => {
            rl.close();
            resolve(number);
        });
    });
}

// Function to save session info
async function saveSessionInfo(phoneNumber, sessionData) {
    try {
        const sessionInfo = {
            phoneNumber,
            sessionId: sessionData.creds?.me?.id || 'unknown',
            connectedAt: new Date().toISOString(),
            lastSeen: new Date().toISOString()
        };
        
        await fs.writeJson('./data/session_info.json', sessionInfo, { spaces: 2 });
        console.log('📱 Session info saved successfully');
        
        botNumber = phoneNumber + '@s.whatsapp.net';
        sessionId = sessionInfo.sessionId;
        
        // Auto-set as owner if no owner configured
        if (!config.OWNER_NUMBER || config.OWNER_NUMBER === '923xxxxxxxxx@s.whatsapp.net') {
            console.log('🤖 Auto-setting bot number as owner...');
            // Update config file
            try {
                const configContent = await fs.readFile('./config.js', 'utf8');
                const updatedConfig = configContent.replace(
                    /OWNER_NUMBER:\s*['"`][^'"`]*['"`]/,
                    `OWNER_NUMBER: '${botNumber}'`
                );
                await fs.writeFile('./config.js', updatedConfig);
                config.OWNER_NUMBER = botNumber;
                console.log('✅ Owner number updated to bot number');
            } catch (error) {
                console.log('⚠️ Could not auto-update owner number. Please set manually in config.js');
            }
        }
        
        return sessionInfo;
    } catch (error) {
        console.error('❌ Error saving session info:', error);
    }
}

// Function to load session info
async function loadSessionInfo() {
    try {
        if (await fs.pathExists('./data/session_info.json')) {
            const sessionInfo = await fs.readJson('./data/session_info.json');
            botNumber = sessionInfo.phoneNumber + '@s.whatsapp.net';
            sessionId = sessionInfo.sessionId;
            console.log('📱 Loaded session for:', sessionInfo.phoneNumber);
            return sessionInfo;
        }
    } catch (error) {
        console.error('❌ Error loading session info:', error);
    }
    return null;
}

async function startDarkHeartBot() {
    // Ensure data directory exists
    await fs.ensureDir('./data');
    
    // Load existing session info
    await loadSessionInfo();
    
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`🔗 Using WA v${version.join('.')}, isLatest: ${isLatest}`);
    
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, console.log)
        },
        printQRInTerminal: false, // We'll handle this manually
        logger: undefined,
        browser: [botInfo.name, 'Chrome', botInfo.version],
        defaultQueryTimeoutMs: undefined,
        generateHighQualityLinkPreview: true
    });    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr, isNewLogin } = update;
        
        if (qr) {
            console.log('🖤 DarkHeart Bot - Connection Options 🖤');
              // Pairing code is the default authentication method
            if (config.USE_PAIRING_CODE) {
                console.log('🔒 Using Pairing Code Authentication (default)');
                
                // Try to get the phone number from multiple sources
                let phoneNumber = process.env.OWNER_NUMBER || config.OWNER_NUMBER || '';
                
                // Clean up the phone number format
                if (phoneNumber) {
                    // Remove any non-numeric characters and @s.whatsapp.net suffix
                    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
                    
                    // Make sure it's a valid length
                    if (phoneNumber.length < 8 || phoneNumber.length > 15) {
                        console.log(`⚠️ Warning: Phone number ${phoneNumber} seems invalid (wrong length)`);
                        phoneNumber = '';
                    } else {
                        console.log(`📱 Using phone number: ${phoneNumber}`);
                    }
                }
                
                // If no valid number found, ask for it
                if (!phoneNumber) {
                    console.log('⚠️ No valid phone number found in environment or config');
                    phoneNumber = await getPairingCode();
                }
                
                if (phoneNumber && phoneNumber.length >= 8) {
                    try {
                        const code = await sock.requestPairingCode(phoneNumber);
                        console.log(`\n🔐 Pairing Code: ${code}`);
                        console.log('─────────────────────────────────────────────────');
                        console.log('📱 Enter this code in WhatsApp > Linked Devices > Link a Device > Link with Phone Number');
                        console.log('─────────────────────────────────────────────────');
                    } catch (err) {
                        console.error('❌ Error requesting pairing code:', err);
                        console.log('📱 Falling back to QR code');
                        qrcode.generate(qr, { small: true });
                    }
                } else {
                    console.log('❌ No valid phone number provided. Falling back to QR code');
                    qrcode.generate(qr, { small: true });
                }
            } else {
                console.log('📷 Scan this QR Code (pairing code disabled):');
                qrcode.generate(qr, { small: true });
                console.log('\nPairing code is disabled. Enable it by setting USE_PAIRING_CODE=true');
            }
        }
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
            
            if (shouldReconnect) {
                startDarkHeartBot();
            }
        } else if (connection === 'open') {
            console.log('🖤 DarkHeart Bot Connected Successfully! 🖤');
            console.log('Bot Name:', botInfo.name);
            console.log('Prefix:', botConfig.prefix);
            console.log('Platform:', config.getPlatform());
            console.log('Time:', moment().format('DD/MM/YYYY HH:mm:ss'));
              // Save session info on successful connection
            if (isNewLogin) {
                const phoneNumber = sock.user?.id?.split(':')[0] || 'unknown';
                await saveSessionInfo(phoneNumber, state);
                console.log('📱 New session saved for:', phoneNumber);
            }
            
            // Set global bot number for notifications
            if (sock.user?.id) {
                global.botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                botNumber = global.botNumber;
            }
              // Send startup notification to bot owner
            if (botNumber || config.OWNER_NUMBER) {
                const ownerJid = botNumber || config.OWNER_NUMBER;
                try {
                    const welcomeText = `🖤 *DarkHeart Bot Connected!* 🖤

✅ *Successfully connected and ready!*
📱 *Session ID:* ${sessionId || 'New Session'}
🕐 *Started at:* ${moment().format('DD/MM/YYYY HH:mm:ss')}

🔧 *Quick Start:*
• Type \`!setup\` for first-time setup guide
• Type \`!menu\` to see all commands
• Type \`!settings\` to configure features

🖤 *Important Notes:*
• All features start as OFF for privacy
• All notifications will be sent to this number
• Use admin commands to enable features per group

🚀 *Ready to use! Welcome to DarkHeart Bot!*`;

                    await sock.sendMessage(ownerJid, {
                        text: welcomeText
                    });
                } catch (error) {
                    console.log('📱 Owner notification will be sent when owner sends first message');
                }
            }
        }    });sock.ev.on('creds.update', saveCreds);

    // Start auto cleanup for 24-hour message deletion
    advancedFeatures.startAutoCleanup();

    // Listen for message deletions
    sock.ev.on('message.delete', async (item) => {
        try {
            const targetOwner = global.botNumber || config.OWNER_NUMBER;
            await advancedFeatures.handleDeletedMessage(sock, item.key, item, targetOwner);
        } catch (error) {
            console.error('Error handling message deletion:', error);
        }
    });

    // Listen for status updates
    sock.ev.on('messages.upsert', async (m) => {
        try {
            const msg = m.messages[0];
              // Handle status updates
            if (msg.key.remoteJid === 'status@broadcast') {
                const targetOwner = global.botNumber || config.OWNER_NUMBER;
                
                // Auto view status
                await advancedFeatures.handleAutoViewStatus(sock, msg, targetOwner);
                
                // Auto react to status
                await advancedFeatures.handleAutoStatusReact(sock, msg);
                
                // Save status if enabled
                const globalSettings = advancedFeatures.getGroupSettings('global');
                if (globalSettings.saveStatus) {
                    await advancedFeatures.saveStatus(sock, msg);
                }
                
                return; // Don't process status as regular message
            }
            
            if (!msg.message || msg.key.fromMe) return;

            const messageType = Object.keys(msg.message)[0];
            const messageContent = msg.message[messageType];
            const from = msg.key.remoteJid;
            const sender = msg.key.participant || from;
            
            let body = '';
            
            if (messageType === 'conversation') {
                body = messageContent;
            } else if (messageType === 'extendedTextMessage') {
                body = messageContent.text;
            }            // Handle anti-view once
            await advancedFeatures.handleViewOnce(sock, msg, from);

            // Handle anti-link
            const linkBlocked = await advancedFeatures.checkAntiLink(sock, msg, from);
            if (linkBlocked) return;

            // Handle auto reactions based on emotion
            if (!body.startsWith(botConfig.prefix)) {
                const messageText = advancedFeatures.extractMessageText(msg);
                const isOwner = sender === config.OWNER_NUMBER;
                
                if (isOwner) {
                    await advancedFeatures.autoReact(sock, msg.key, from, true);
                } else {
                    await advancedFeatures.emotionReact(sock, msg.key, from, messageText);
                    await advancedFeatures.autoReact(sock, msg.key, from, false);
                }
            }

            body = body.toLowerCase().trim();

            // Log message
            console.log(`📱 Message from ${sender}: ${body}`);

            // Check if message starts with prefix
            if (!body.startsWith(botConfig.prefix)) return;            const command = body.slice(botConfig.prefix.length).trim();
            const args = command.split(' ');
            const cmd = args[0];

            // Check for command aliases
            const actualCommand = commandHandler.findCommandByAlias(cmd) || cmd;

            // Log command usage
            commandHandler.logCommand(sender, actualCommand);

            // Check cooldown
            if (commandHandler.checkCooldown(sender, actualCommand)) {
                await sock.sendMessage(from, { 
                    text: `🖤 *Cooldown Active* 🖤\n\n⏳ Please wait a moment before using this command again.` 
                });
                return;
            }// Handle Commands
            switch (actualCommand) {
                case 'menu':
                case 'help':
                case 'commands':
                    await sendMenuMessage(sock, from);
                    break;
                    
                case 'ping':
                case 'pong':
                    await sock.sendMessage(from, { 
                        text: `🖤 *DarkHeart Bot* 🖤\n\n🏓 Pong!\n⚡ Bot is active and running!\n\n📅 ${moment().format('DD/MM/YYYY')}\n🕐 ${moment().format('HH:mm:ss')}` 
                    });
                    break;
                    
                case 'info':
                case 'about':
                case 'botinfo':
                    await sendBotInfo(sock, from);
                    break;
                    
                case 'time':
                case 'date':
                case 'clock':
                    await sock.sendMessage(from, { 
                        text: `🖤 *Current Time* 🖤\n\n📅 Date: ${moment().format('DD/MM/YYYY')}\n🕐 Time: ${moment().format('HH:mm:ss')}\n🌍 Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}` 
                    });
                    break;
                    
                case 'quote':
                case 'quotes':
                case 'motivation':
                    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
                    await sock.sendMessage(from, { 
                        text: `🖤 *Daily Quote* 🖤\n\n💭 "${randomQuote}"\n\n✨ Stay motivated!` 
                    });
                    break;

                case 'joke':
                case 'jokes':
                case 'funny':
                    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
                    await sock.sendMessage(from, { 
                        text: `🖤 *DarkHeart Jokes* 🖤\n\n😂 ${randomJoke}\n\n😄 Hope that made you smile!` 
                    });
                    break;                case 'calc':
                case 'calculate':
                case 'math':
                    const expression = args.slice(1).join(' ');
                    await handleCalculator(sock, from, expression);
                    break;

                // Advanced Features Commands
                case 'antidelete':
                    await commandHandlers.handleAntiDelete(sock, from, args.slice(1), await isAdmin(sock, from, sender));
                    break;

                case 'antilink':
                    await commandHandlers.handleAntiLink(sock, from, args.slice(1), await isAdmin(sock, from, sender));
                    break;

                case 'autoreact':
                    await commandHandlers.handleAutoReact(sock, from, args.slice(1), await isAdmin(sock, from, sender));
                    break;

                case 'customemoji':
                    await commandHandlers.handleCustomEmoji(sock, from, args.slice(1), await isAdmin(sock, from, sender));
                    break;

                case 'antiviewonce':
                    await commandHandlers.handleAntiViewOnce(sock, from, args.slice(1), await isAdmin(sock, from, sender));
                    break;                case 'savestatus':
                    await commandHandlers.handleSaveStatus(sock, from, args.slice(1), sender === config.OWNER_NUMBER);
                    break;

                case 'autoviewstatus':
                    await commandHandlers.handleAutoViewStatus(sock, from, args.slice(1), sender === config.OWNER_NUMBER);
                    break;

                case 'autostatusreact':
                    await commandHandlers.handleAutoStatusReact(sock, from, args.slice(1), sender === config.OWNER_NUMBER);
                    break;

                case 'statusreactemoji':
                    await commandHandlers.handleStatusReactEmoji(sock, from, args.slice(1), sender === config.OWNER_NUMBER);
                    break;

                case 'settings':
                    await commandHandlers.handleSettings(sock, from);
                    break;

                case 'ownerreact':
                    if (sender === config.OWNER_NUMBER) {
                        await commandHandlers.handleOwnerReact(sock, from, args.slice(1), msg.key);
                    } else {
                        await sock.sendMessage(from, { 
                            text: '🚫 *Access Denied* 🚫\n\nOnly bot owner can use this command.' 
                        });
                    }
                    break;                case 'viewstatus':
                case 'savedstatus':
                    await commandHandlers.handleViewSavedStatuses(sock, from, sender === config.OWNER_NUMBER);
                    break;                case 'session':
                case 'sessioninfo':
                    if (sender === (global.botNumber || config.OWNER_NUMBER)) {
                        const sessionInfo = await loadSessionInfo();
                        const sessionText = `🖤 *DarkHeart Bot Session Info* 🖤

📱 *Bot Number:* ${global.botNumber?.split('@')[0] || 'Not set'}
🆔 *Session ID:* ${sessionId || 'Unknown'}
⏰ *Connected At:* ${sessionInfo?.connectedAt ? moment(sessionInfo.connectedAt).format('DD/MM/YYYY HH:mm:ss') : 'Unknown'}
🕐 *Current Time:* ${moment().format('DD/MM/YYYY HH:mm:ss')}
🔗 *Status:* Online & Active

🤖 *Session Management:*
• All notifications sent to: ${global.botNumber?.split('@')[0] || 'Owner number'}
• Auto-delete reports: Active
• Status monitoring: Active
• Session persistence: Enabled`;

                        await sock.sendMessage(from, { text: sessionText });
                    } else {
                        await sock.sendMessage(from, { 
                            text: '🚫 *Access Denied* 🚫\n\nOnly bot owner can view session information.' 
                        });
                    }
                    break;                case 'setup':
                case 'firstsetup':
                    if (sender === (global.botNumber || config.OWNER_NUMBER)) {
                        const setupText = `🖤 *DarkHeart Bot Setup Guide* 🖤

✅ *Bot Successfully Connected!*
📱 *Your Number:* ${sender.split('@')[0]}
🤖 *Bot Number:* ${global.botNumber?.split('@')[0] || 'Unknown'}

🔧 *Quick Setup Commands:*
• \`!settings\` - View all feature settings
• \`!antidelete on\` - Enable deleted message recovery
• \`!autoreact on\` - Enable emotion-based reactions
• \`!autoviewstatus on\` - Enable auto status viewing
• \`!savestatus on\` - Enable status saving

🎯 *Default Settings:*
🔴 All features start as OFF for privacy
🔴 Only admins can change group settings
🔴 Only owner can change global settings

💡 *Tips:*
• Use \`!menu\` to see all commands
• All notifications will come to this number
• Features are toggleable per group
• Status features work globally

🖤 *Ready to use! Type !menu to start*`;

                        await sock.sendMessage(from, { text: setupText });
                    } else {
                        await sock.sendMessage(from, { 
                            text: '🚫 *Access Denied* 🚫\n\nOnly bot owner can access setup guide.' 
                        });
                    }
                    break;

                case 'cleanup':
                case 'clean':
                case 'clear':
                    if (sender === (global.botNumber || config.OWNER_NUMBER) || await isAdmin(sock, from, sender)) {
                        const cleanupResult = await advancedFeatures.manualCleanup();
                        await sock.sendMessage(from, { text: cleanupResult });
                    } else {
                        await sock.sendMessage(from, { 
                            text: '🚫 *Access Denied* 🚫\n\nOnly admins and bot owner can use cleanup commands.' 
                        });
                    }
                    break;

                case 'cleanupstats':
                case 'stats':
                    if (sender === (global.botNumber || config.OWNER_NUMBER) || await isAdmin(sock, from, sender)) {
                        const stats = advancedFeatures.getCleanupStats();
                        const statsText = `📊 *Cleanup Statistics* 📊

🗑️ *Deleted Messages:* ${stats.deletedMessages}
📱 *Deleted Statuses:* ${stats.deletedStatuses}
🕐 *Last Cleanup:* ${moment(stats.lastCleanup).format('DD/MM/YYYY HH:mm:ss')}

⚙️ *Auto Cleanup Settings:*
• Runs every hour automatically
• Deletes data older than 24 hours
• Includes messages, statuses, and media files

🖤 *Privacy Protection: Data is automatically deleted after 24 hours*`;
                        
                        await sock.sendMessage(from, { text: statsText });
                    } else {
                        await sock.sendMessage(from, { 
                            text: '🚫 *Access Denied* 🚫\n\nOnly admins and bot owner can view cleanup stats.' 
                        });
                    }
                    break;
                    
                default:
                    await sock.sendMessage(from, { 
                        text: `🖤 *DarkHeart Bot* 🖤\n\n❌ Unknown command: *${actualCommand}*\n\nType *${botConfig.prefix}menu* to see available commands.` 
                    });
                    commandHandler.logCommand(sender, actualCommand, false);
            }

        } catch (error) {
            console.error('Error handling message:', error);
        }    });

    // Handle message delete for anti-delete feature
    sock.ev.on('messages.delete', async (update) => {
        await advancedFeatures.handleMessageDelete(sock, update);
    });

    // Welcome new group members
    sock.ev.on('group-participants.update', async (update) => {
        try {
            const { id, participants, action } = update;
            
            if (action === 'add') {
                for (const participant of participants) {                    await sock.sendMessage(id, {
                        text: `🖤 *Welcome to DarkHeart Bot Group!* 🖤\n\n👋 Welcome @${participant.split('@')[0]}!\n\n✨ Enjoy your stay and follow group rules.\n\nType *${config.prefix}menu* for bot commands.`,
                        mentions: [participant]
                    });
                }
            }
        } catch (error) {
            console.error('Error in group update:', error);
        }
    });
}

async function sendMenuMessage(sock, from) {
    const menuText = commandHandler.generateFullMenu();
    await sock.sendMessage(from, { text: menuText });
}

async function sendHelpMessage(sock, from) {
    // Redirect to menu for backward compatibility
    await sendMenuMessage(sock, from);
}

async function sendBotInfo(sock, from) {
    const infoText = `🖤 *DarkHeart Bot Information* 🖤

🤖 *Bot Name:* ${botInfo.name}
⚡ *Version:* ${botInfo.version}
🔧 *Library:* ${botInfo.library}
📅 *Created:* ${botInfo.created}
👨‍💻 *Author:* ${botInfo.author}
🚀 *Status:* Active & Running

🌟 *Features:*
• 24/7 Online
• Fast Response
• Group Management
• Auto Welcome
• Custom Commands
• Calculator & Utils
• Fun Commands

💻 *Tech Stack:*
• Node.js
• Baileys Library
• Multi-Device Support

🖤 *Developed with ❤️ by ${botInfo.author}*`;

    await sock.sendMessage(from, { text: infoText });
}

// Helper function to check if user is admin
async function isAdmin(sock, groupId, userId) {
    try {
        if (!Utils.isGroupChat(groupId)) return false;
        
        const groupMetadata = await sock.groupMetadata(groupId);
        const adminList = groupMetadata.participants.filter(p => p.admin !== null).map(p => p.id);
        
        return adminList.includes(userId);
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Calculator function
async function handleCalculator(sock, from, expression) {
    if (!expression) {
        await sock.sendMessage(from, { 
            text: `🖤 *Calculator* 🖤\n\n❌ Please provide a mathematical expression.\n\n📝 Usage: *${config.prefix}calc 2+2*\n\n🔢 Supported operations: +, -, *, /, %, ^, sqrt, sin, cos, tan` 
        });
        return;
    }

    try {
        // Simple calculator with basic security
        const sanitized = expression.replace(/[^0-9+\-*/.()%\s]/g, '');
        
        // Handle some basic math functions
        let result;
        if (sanitized.includes('sqrt')) {
            const num = parseFloat(sanitized.replace('sqrt', ''));
            result = Math.sqrt(num);
        } else {
            result = eval(sanitized);
        }

        await sock.sendMessage(from, { 
            text: `🖤 *Calculator Result* 🖤\n\n📝 Expression: \`${expression}\`\n🔢 Result: \`${result}\`\n\n✅ Calculation completed!` 
        });
    } catch (error) {
        await sock.sendMessage(from, { 
            text: `🖤 *Calculator Error* 🖤\n\n❌ Invalid expression: \`${expression}\`\n\n💡 Please check your syntax and try again.\n\n📝 Example: *${config.prefix}calc 10 + 5 * 2*` 
        });
    }
}

// Start the bot
console.log('🖤 Starting DarkHeart WhatsApp Bot... 🖤');
startDarkHeartBot().catch(console.error);

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🖤 DarkHeart Bot shutting down... 🖤');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});
