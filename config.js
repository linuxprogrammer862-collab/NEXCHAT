// config.js - Application Configuration
export const appConfig = {
    // Application Settings
    app: {
        name: 'NEX-REELS',
        version: '1.0.0',
        description: 'Your Viral Video Platform',
        tagline: 'Create. Share. Go Viral.',
        maxVideoSize: 500 * 1024 * 1024, // 500MB
        maxThumbnailSize: 5 * 1024 * 1024, // 5MB
        allowedVideoFormats: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
        allowedImageFormats: ['image/jpeg', 'image/png', 'image/webp']
    },

    // UI Configuration
    ui: {
        videosPerPage: 20,
        commentsPerPage: 10,
        notificationsPerPage: 15,
        sidebarCollapsible: true,
        autoHideNavbar: false,
        darkModeDefault: true,
        animationsEnabled: true,
        transitionDuration: 300 // ms
    },

    // Video Configuration
    video: {
        autoPlay: false,
        controls: true,
        loop: false,
        muted: false,
        preload: 'metadata',
        width: '100%',
        height: 'auto',
        aspectRatio: '9/16',
        defaultQuality: '720p',
        qualityOptions: ['360p', '480p', '720p', '1080p']
    },

    // Categories
    categories: [
        { id: 'dance', label: 'Dance', icon: 'fas-music' },
        { id: 'comedy', label: 'Comedy', icon: 'fas-laugh' },
        { id: 'music', label: 'Music', icon: 'fas-music' },
        { id: 'sports', label: 'Sports', icon: 'fas-football' },
        { id: 'fashion', label: 'Fashion', icon: 'fas-shirt' },
        { id: 'food', label: 'Food', icon: 'fas-utensils' },
        { id: 'education', label: 'Education', icon: 'fas-book' },
        { id: 'travel', label: 'Travel', icon: 'fas-globe' },
        { id: 'beauty', label: 'Beauty', icon: 'fas-spa' },
        { id: 'gaming', label: 'Gaming', icon: 'fas-gamepad' }
    ],

    // API Configuration
    api: {
        timeout: 10000, // 10 seconds
        retryAttempts: 3,
        retryDelay: 1000 // ms
    },

    // Notifications
    notifications: {
        enabled: true,
        desktop: true,
        sound: true,
        vibration: true,
        duration: 3000 // ms
    },

    // Search
    search: {
        minChars: 1,
        debounceDelay: 300, // ms
        maxResults: 50
    },

    // Social Features
    social: {
        followUnfollowEnabled: true,
        likeEnabled: true,
        commentEnabled: true,
        shareEnabled: true,
        bookmarkEnabled: true,
        messageEnabled: true
    },

    // Pagination
    pagination: {
        videosPerPage: 20,
        initialLoad: 10,
        loadMoreThreshold: 3 // Load more when 3 items from bottom
    },

    // Cache Configuration
    cache: {
        enabled: true,
        ttl: 3600000, // 1 hour in ms
        maxSize: 50 * 1024 * 1024 // 50MB
    },

    // Analytics
    analytics: {
        enabled: false,
        trackingId: '', // Add your tracking ID
        trackPageViews: true,
        trackEvents: true
    },

    // Security
    security: {
        contentSecurityPolicy: true,
        xFrameOptions: true,
        xContentTypeOptions: true,
        corsEnabled: true,
        allowedOrigins: ['*']
    },

    // Rate Limiting
    rateLimiting: {
        enabled: true,
        requests: 100,
        timeWindow: 60000 // 1 minute
    },

    // Social Media Sharing
    socialMedia: {
        twitter: {
            enabled: true,
            handle: '@nexreels'
        },
        facebook: {
            enabled: true,
            appId: ''
        },
        instagram: {
            enabled: true,
            handle: '@nexreels'
        },
        tiktok: {
            enabled: true,
            handle: '@nexreels'
        }
    },

    // Feature Flags
    features: {
        liveStreaming: false,
        duets: false,
        stitches: false,
        greenScreen: false,
        filters: false,
        effects: false,
        music: false,
        stickers: false,
        trends: false,
        challenges: false
    },

    // Email Configuration
    email: {
        enabled: false,
        sendWelcomeEmail: true,
        sendNotificationEmails: true,
        sendMarketingEmails: false,
        unsubscribeLink: true
    },

    // Theme Colors
    theme: {
        primary: '#fe2c55',
        secondary: '#00f7ef',
        darkBg: '#0a0e27',
        cardBg: '#111',
        textPrimary: '#ffffff',
        textSecondary: '#a0a0a0',
        borderColor: '#222',
        successColor: '#4caf50',
        errorColor: '#f44336',
        warningColor: '#ff9800',
        infoColor: '#2196f3'
    },

    // Font Configuration
    fonts: {
        primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
        mono: '"Courier New", Courier, monospace'
    },

    // API Endpoints (for future backend)
    endpoints: {
        api: 'https://api.nexreels.com',
        cdn: 'https://cdn.nexreels.com',
        images: 'https://images.nexreels.com',
        videos: 'https://videos.nexreels.com'
    },

    // Maintenance
    maintenance: {
        enabled: false,
        message: 'NEX-REELS is under maintenance. Please check back soon!',
        showProgressBar: true
    },

    // Debug
    debug: {
        enabled: false,
        logLevel: 'info', // 'debug', 'info', 'warn', 'error'
        logToConsole: true,
        logToServer: false
    }
};

// Get config value
export function getConfig(key, defaultValue = null) {
    const keys = key.split('.');
    let value = appConfig;
    
    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            return defaultValue;
        }
    }
    
    return value;
}

// Set config value
export function setConfig(key, value) {
    const keys = key.split('.');
    let obj = appConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!(k in obj) || typeof obj[k] !== 'object') {
            obj[k] = {};
        }
        obj = obj[k];
    }
    
    obj[keys[keys.length - 1]] = value;
}

// Merge custom config
export function mergeConfig(customConfig) {
    Object.keys(customConfig).forEach(key => {
        if (typeof customConfig[key] === 'object' && !Array.isArray(customConfig[key])) {
            appConfig[key] = { ...appConfig[key], ...customConfig[key] };
        } else {
            appConfig[key] = customConfig[key];
        }
    });
}

export default appConfig;
