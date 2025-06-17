// DarkHeart Bot Commands Handler
// This file manages all bot commands

const settings = require('./settings');
const moment = require('moment');

class CommandHandler {
    constructor() {
        this.settings = settings;
        this.commands = new Map();
        this.cooldowns = new Map();
        this.registerCommands();
    }

    registerCommands() {
        // Register all commands from settings
        Object.keys(this.settings.commands).forEach(command => {
            this.commands.set(command, this.settings.commands[command]);
        });
    }

    // Check if user is on cooldown
    checkCooldown(userId, command) {
        const cooldownKey = `${userId}_${command}`;
        const lastUsed = this.cooldowns.get(cooldownKey);
        const cooldownTime = this.settings.adminSettings.cooldown;

        if (lastUsed && (Date.now() - lastUsed) < cooldownTime) {
            return true;
        }

        this.cooldowns.set(cooldownKey, Date.now());
        return false;
    }

    // Get command category
    getCommandCategory(command) {
        const cmd = this.commands.get(command);
        return cmd ? cmd.category : null;
    }

    // Get commands by category
    getCommandsByCategory(category) {
        const categoryCommands = [];
        
        this.commands.forEach((cmdData, cmdName) => {
            if (cmdData.category === category) {
                categoryCommands.push({
                    name: cmdName,
                    ...cmdData
                });
            }
        });

        return categoryCommands;
    }

    // Generate help text for category
    generateCategoryHelp(category) {
        const commands = this.getCommandsByCategory(category);
        const categoryInfo = this.settings.menuCategories[category];
        
        let helpText = `${categoryInfo.emoji} *${categoryInfo.title}*\n`;
        helpText += `${categoryInfo.description}\n\n`;

        commands.forEach(cmd => {
            helpText += `${categoryInfo.emoji} *${this.settings.config.prefix}${cmd.name}* - ${cmd.description}\n`;
        });

        return helpText;
    }

    // Generate full menu
    generateFullMenu() {
        const { config, botInfo, menuCategories } = this.settings;
        
        let menuText = `🖤 *DarkHeart Bot - Main Menu* 🖤\n\n`;

        // General Commands
        menuText += `┌─── ${menuCategories.general.emoji} *${menuCategories.general.title}* ───┐\n`;
        const generalCommands = this.getCommandsByCategory('general');
        generalCommands.forEach(cmd => {
            menuText += `│ ${menuCategories.general.emoji} *${config.prefix}${cmd.name}* - ${cmd.description}\n`;
        });
        menuText += `└────────────────────────────┘\n\n`;

        // Utility Commands
        menuText += `┌─── ${menuCategories.utility.emoji} *${menuCategories.utility.title}* ───┐\n`;
        const utilityCommands = this.getCommandsByCategory('utility');
        utilityCommands.forEach(cmd => {
            menuText += `│ ${menuCategories.utility.emoji} *${config.prefix}${cmd.name}* - ${cmd.description}\n`;
        });
        menuText += `└────────────────────────────┘\n\n`;        // Fun Commands
        menuText += `┌─── ${menuCategories.fun.emoji} *${menuCategories.fun.title}* ───┐\n`;
        const funCommands = this.getCommandsByCategory('fun');
        funCommands.forEach(cmd => {
            menuText += `│ ${menuCategories.fun.emoji} *${config.prefix}${cmd.name}* - ${cmd.description}\n`;
        });
        menuText += `└────────────────────────────┘\n\n`;

        // Admin Commands
        menuText += `┌─── ${menuCategories.admin.emoji} *${menuCategories.admin.title}* ───┐\n`;
        const adminCommands = this.getCommandsByCategory('admin');
        adminCommands.forEach(cmd => {
            menuText += `│ ${menuCategories.admin.emoji} *${config.prefix}${cmd.name}* - ${cmd.description}\n`;
        });
        menuText += `└────────────────────────────┘\n\n`;

        menuText += `📝 *How to use:*\n`;
        menuText += `Type any command with prefix *${config.prefix}*\n\n`;
        menuText += `Example: *${config.prefix}ping*\n\n`;
        menuText += `🖤 *DarkHeart Bot v${botInfo.version}* - Always at your service!\n\n`;
        menuText += `💡 *Tip:* Admin commands require group admin privileges`;

        return menuText;
    }

    // Check if command exists
    commandExists(command) {
        return this.commands.has(command);
    }

    // Get command aliases
    getCommandAliases(command) {
        const cmd = this.commands.get(command);
        return cmd ? cmd.aliases || [] : [];
    }

    // Find command by alias
    findCommandByAlias(alias) {
        for (const [cmdName, cmdData] of this.commands) {
            if (cmdData.aliases && cmdData.aliases.includes(alias)) {
                return cmdName;
            }
        }
        return null;
    }

    // Log command usage
    logCommand(userId, command, success = true) {
        const timestamp = moment().format('DD/MM/YYYY HH:mm:ss');
        const status = success ? '✅' : '❌';
        console.log(`${status} [${timestamp}] Command: ${command} | User: ${userId}`);
    }
}

module.exports = CommandHandler;
