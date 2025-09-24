/**
 * Default configuration values
 * These are the base settings that apply to all environments
 * Environment-specific files will override these values
 */

const defaultConfig = {
  // API Configuration
  apiBase: 'http://localhost:4000',
  
  // Environment
  env: 'development',
  
  // LLM Provider
  llmProvider: 'mock',
  
  // Development Features
  enableDevMode: true,
  
  // Analytics
  analyticsEnabled: false,
  
  // Third-party Services (empty by default - set via env vars)
  stripePublicKey: '',
  sentryDsn: '',
  
  // Feature Flags
  featureFlags: {
    showRawExtraction: true,
    enableAdvancedFilters: false,
    showDebugInfo: true,
  },
  
  // Performance Settings
  maxPollingIntervalMs: 30000,
  
  // Logging
  logLevel: 'debug',
};

module.exports = defaultConfig;