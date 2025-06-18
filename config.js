// DarkHeart Bot - Environment Configuration
// Handles environment variables and production settings

require('dotenv').config();

const config = {
    // Environment
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3000,
    
    // Bot Configuration
    BOT_PREFIX: process.env.BOT_PREFIX || process.env.PREFIX || '!',
    OWNER_NUMBER: process.env.OWNER_NUMBER || '923xxxxxxxxx@s.whatsapp.net',
    BOT_NAME: process.env.BOT_NAME || 'DarkHeart',
    TIMEZONE: process.env.TIMEZONE || 'Asia/Karachi',
      // Authentication Configuration
    USE_PAIRING_CODE: process.env.USE_PAIRING_CODE !== 'false', // Default to true unless explicitly set to false
    
    // API Keys
    WEATHER_API_KEY: process.env.WEATHER_API_KEY || '',
    TRANSLATE_API_KEY: process.env.TRANSLATE_API_KEY || '',
    NEWS_API_KEY: process.env.NEWS_API_KEY || '',
    
    // Database
    DATABASE_URL: process.env.DATABASE_URL || '',
    
    // Webhook
    WEBHOOK_URL: process.env.WEBHOOK_URL || '',
    
    // Feature Flags
    ENABLE_LOGGING: process.env.ENABLE_LOGGING !== 'false',
    ENABLE_DATABASE: process.env.ENABLE_DATABASE !== 'false',
    ENABLE_WEBHOOK: process.env.ENABLE_WEBHOOK === 'true',
    
    // Rate Limiting
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 10,
    RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000,
    
    // Media Settings
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024, // 50MB
    ALLOWED_MEDIA_TYPES: (process.env.ALLOWED_MEDIA_TYPES || 'image,video,audio,document').split(','),
    
    // Security
    ADMIN_ONLY_COMMANDS: (process.env.ADMIN_ONLY_COMMANDS || 'restart,shutdown,eval').split(','),
    MAINTENANCE_MODE: process.env.MAINTENANCE_MODE === 'true',
    
    // Cloud Platform Detection
    isHeroku: !!process.env.DYNO,
    isRailway: !!process.env.RAILWAY_ENVIRONMENT,
    isRender: !!process.env.RENDER,
    isVercel: !!process.env.VERCEL,
    
    // Get platform name
    getPlatform() {
        if (this.isHeroku) return 'Heroku';
        if (this.isRailway) return 'Railway';
        if (this.isRender) return 'Render';
        if (this.isVercel) return 'Vercel';
        return 'Local';
    },
    
    // Check if running in production
    isProduction() {
        return this.NODE_ENV === 'production';
    },
    
    // Check if running on cloud
    isCloud() {
        return this.isHeroku || this.isRailway || this.isRender || this.isVercel;
    }
};

module.exports = config;
