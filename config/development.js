/**
 * Development environment configuration
 * Overrides default.js values for local development
 */

const developmentConfig = {
  // API Configuration - local backend
  apiBase: 'http://localhost:4000',
  
  // Environment
  env: 'development',
  
  // LLM Provider - use mock for faster development
  llmProvider: 'mock',
  
  // Development Features
  enableDevMode: true,
  
  // Analytics - disabled in development
  analyticsEnabled: false,
  
  // Feature Flags - enable all dev features
  featureFlags: {
    showRawExtraction: true,
    enableAdvancedFilters: true,
    showDebugInfo: true,
  },
  
  // Performance Settings - shorter polling for faster feedback
  maxPollingIntervalMs: 5000,
  
  // Logging - verbose in development
  logLevel: 'debug',
};

module.exports = developmentConfig;