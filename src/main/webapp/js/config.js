/**
 * HR Intranet Portal Configuration
 * =================================
 * 
 * ENVIRONMENT SETUP:
 * ------------------
 * This configuration automatically detects whether you're running in development
 * (localhost) or production (actual domain).
 * 
 * FOR DEVELOPMENT (automatic):
 * - No changes needed
 * - Automatically uses: http://localhost:8080/api
 * 
 * FOR PRODUCTION:
 * 1. Update PRODUCTION_API_URL below with your actual API URL
 *    Example: 'https://api.yourcompany.com/api'
 *           or 'https://yourcompany.com/hr-portal/api'
 * 
 * 2. Ensure your backend is deployed and accessible at that URL
 * 
 * 3. (Optional) Force production mode by setting ENVIRONMENT to 'production'
 *    instead of 'auto' if auto-detection doesn't work
 * 
 * MANUAL OVERRIDE:
 * ----------------
 * To manually set environment, change ENVIRONMENT from 'auto' to:
 * - 'development' - Always use localhost:8080
 * - 'production'  - Always use production URL
 * 
 * SETUP INSTRUCTIONS:
 * 1. Ensure backend server is running on port 8080 (dev) or configured port (prod)
 * 2. Ensure database is properly configured and populated
 * 3. Access the portal at configured URL
 * 
 * CURRENT STATUS:
 * You can check the current API URL in browser console: CONFIG.API_BASE_URL
 */

const CONFIG = {
    // ============================================
    // ENVIRONMENT CONFIGURATION
    // ============================================
    // Options: 'auto', 'development', 'production'
    // 'auto' will detect based on hostname
    ENVIRONMENT: 'auto',
    
    // Production API URL (update this for your production environment)
    PRODUCTION_API_URL: 'https://your-domain.com/api',
    
    // Development API URL
    // Works for both Maven Spring Boot and Tomcat WAR (when deployed as ROOT.war
    DEVELOPMENT_API_URL: 'http://localhost:8080/api',
    
    // Auto-detect API URL based on environment
    get API_BASE_URL() {
        let env = this.ENVIRONMENT;
        
        // Auto-detect environment
        if (env === 'auto') {
            const hostname = window.location.hostname;
            env = (hostname === 'localhost' || hostname === '127.0.0.1') 
                ? 'development' 
                : 'production';
        }
        
        return env === 'production' 
            ? this.PRODUCTION_API_URL 
            : this.DEVELOPMENT_API_URL;
    },
    
    // Maximum number of items to display in each section
    MAX_JOINERS: 6,           // Max new joiners to display
    MAX_HOLIDAYS: 5,          // Max holidays to display
    MAX_ANNOUNCEMENTS: 10,    // Max announcements to display
    MAX_CAROUSEL_SLIDES: 2000,  // Max carousel slides (supports up to 2000 photos)
    
    CAROUSEL_INTERVAL: 5000,  // Time between slides (milliseconds)
    CAROUSEL_PAUSE_ON_HOVER: true,
    
   
    // Show only future holidays (set to false to show all)
    SHOW_ONLY_FUTURE_HOLIDAYS: true,
    
    // Number of days to consider a joiner as "new"
    NEW_JOINER_DAYS: 30,
    
    // ============================================
    // DEFAULT IMAGES
    // ============================================
    // Default image when no image is provided
    DEFAULT_JOINER_IMAGE: '',  // Leave empty for placeholder
    DEFAULT_HOLIDAY_IMAGE: '', // Leave empty for no image
    DEFAULT_CAROUSEL_IMAGE: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDEyMDAgNDAwIj48cmVjdCB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiM2NjdlZWEiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQ4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkhSIFBvcnRhbDwvdGV4dD48L3N2Zz4=',
    
    // Auto-refresh interval in minutes (0 to disable)
    AUTO_REFRESH_MINUTES: 0,
    
    // Set to true to see console logs
    DEBUG: true
};

// Debug logger
function debugLog(...args) {
    if (CONFIG.DEBUG) {
        console.log('[HR Portal Debug]', ...args);
    }
}

// Log environment configuration on load
(function() {
    const hostname = window.location.hostname;
    const env = CONFIG.ENVIRONMENT === 'auto' 
        ? ((hostname === 'localhost' || hostname === '127.0.0.1') ? 'development' : 'production')
        : CONFIG.ENVIRONMENT;
    
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #00629b');
    console.log('%c🏢 HR INTRANET PORTAL - CONFIGURATION', 'color: #00629b; font-weight: bold; font-size: 14px');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #00629b');
    console.log(`%c🌍 Environment:`, 'color: #00629b; font-weight: bold', env.toUpperCase());
    console.log(`%c🔗 API Base URL:`, 'color: #00629b; font-weight: bold', CONFIG.API_BASE_URL);
    console.log(`%c🖥️  Hostname:`, 'color: #00629b', hostname);
    console.log(`%c🐛 Debug Mode:`, 'color: #00629b', CONFIG.DEBUG ? 'ENABLED' : 'DISABLED');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #00629b');
    
    if (env === 'production' && CONFIG.PRODUCTION_API_URL.includes('your-domain.com')) {
        console.warn('%c⚠️  WARNING: Production API URL not configured!', 'color: #ff9800; font-weight: bold; font-size: 12px');
        console.warn('%c   Please update PRODUCTION_API_URL in js/config.js', 'color: #ff9800');
    }
})();
