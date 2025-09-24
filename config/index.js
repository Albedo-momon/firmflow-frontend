/**
 * Main configuration loader
 * Merges default config with environment-specific config and runtime environment variables
 */

const defaultConfig = require('./default');

/**
 * Type coercion utilities for environment variables
 */
function coerceBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return false;
}

function coerceNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Get the current environment
 * Priority: NEXT_PUBLIC_ENV > NODE_ENV > 'development'
 */
function getEnvironment() {
  return process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || 'development';
}

/**
 * Load environment-specific configuration
 */
function loadEnvironmentConfig(env) {
  try {
    switch (env) {
      case 'production':
        return require('./production');
      case 'development':
        return require('./development');
      case 'staging':
        // Fallback to production config if staging.js doesn't exist
        try {
          return require('./staging');
        } catch (error) {
          // Staging config doesn't exist, use production
          return require('./production');
        }
      default:
        return require('./development');
    }
  } catch (error) {
    console.warn(`Failed to load config for environment "${env}", falling back to default`);
    return {};
  }
}

/**
 * Extract configuration overrides from environment variables
 */
function getEnvironmentOverrides() {
  const overrides = {};
  
  // API Configuration
  if (process.env.NEXT_PUBLIC_API_BASE) {
    overrides.apiBase = process.env.NEXT_PUBLIC_API_BASE;
  }
  
  // Environment
  if (process.env.NEXT_PUBLIC_ENV) {
    overrides.env = process.env.NEXT_PUBLIC_ENV;
  }
  
  // LLM Provider
  if (process.env.NEXT_PUBLIC_LLM_PROVIDER) {
    overrides.llmProvider = process.env.NEXT_PUBLIC_LLM_PROVIDER;
  }
  
  // Development Mode
  if (process.env.NEXT_PUBLIC_ENABLE_DEV_MODE !== undefined) {
    overrides.enableDevMode = coerceBoolean(process.env.NEXT_PUBLIC_ENABLE_DEV_MODE);
  }
  
  // Analytics
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== undefined) {
    overrides.analyticsEnabled = coerceBoolean(process.env.NEXT_PUBLIC_ANALYTICS_ENABLED);
  }
  
  // Third-party Services
  if (process.env.NEXT_PUBLIC_STRIPE_KEY) {
    overrides.stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_KEY;
  }
  
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    overrides.sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  }
  
  // Performance Settings
  if (process.env.NEXT_PUBLIC_MAX_POLLING_INTERVAL_MS) {
    overrides.maxPollingIntervalMs = coerceNumber(process.env.NEXT_PUBLIC_MAX_POLLING_INTERVAL_MS);
  }
  
  // Logging
  if (process.env.NEXT_PUBLIC_LOG_LEVEL) {
    overrides.logLevel = process.env.NEXT_PUBLIC_LOG_LEVEL;
  }
  
  // Feature Flags (individual overrides)
  const featureFlags = {};
  if (process.env.NEXT_PUBLIC_SHOW_RAW_EXTRACTION !== undefined) {
    featureFlags.showRawExtraction = coerceBoolean(process.env.NEXT_PUBLIC_SHOW_RAW_EXTRACTION);
  }
  if (process.env.NEXT_PUBLIC_ENABLE_ADVANCED_FILTERS !== undefined) {
    featureFlags.enableAdvancedFilters = coerceBoolean(process.env.NEXT_PUBLIC_ENABLE_ADVANCED_FILTERS);
  }
  if (process.env.NEXT_PUBLIC_SHOW_DEBUG_INFO !== undefined) {
    featureFlags.showDebugInfo = coerceBoolean(process.env.NEXT_PUBLIC_SHOW_DEBUG_INFO);
  }
  
  if (Object.keys(featureFlags).length > 0) {
    overrides.featureFlags = featureFlags;
  }
  
  return overrides;
}

/**
 * Deep merge objects (simple implementation for config merging)
 */
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

/**
 * Main configuration loader function
 * Returns the final merged configuration object
 */
function getConfig() {
  const env = getEnvironment();
  const envConfig = loadEnvironmentConfig(env);
  const envOverrides = getEnvironmentOverrides();
  
  // Merge: default < environment-specific < environment variables
  let config = deepMerge(defaultConfig, envConfig);
  config = deepMerge(config, envOverrides);
  
  // Ensure env is set correctly
  config.env = env;
  
  return config;
}

// Export the configuration
const config = getConfig();

module.exports = {
  getConfig,
  config,
  // Export individual functions for testing
  getEnvironment,
  coerceBoolean,
  coerceNumber,
};