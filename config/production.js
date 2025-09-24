/**
 * Production environment configuration
 * Overrides default.js values for production deployment
 */

const productionConfig = {
  // API Configuration - production backend
  apiBase: 'https://api.firmflow.in',
  
  // Environment
  env: 'production',
  
  // LLM Provider - use real provider in production
  llmProvider: 'anthropic',
  
  // Development Features - disabled in production
  enableDevMode: false,
  
  // Analytics - enabled in production
  analyticsEnabled: true,
  
  // Feature Flags - conservative settings for production
  featureFlags: {
    showRawExtraction: false,
    enableAdvancedFilters: true,
    showDebugInfo: false,
  },
  
  // Performance Settings - longer polling for production stability
  maxPollingIntervalMs: 30000,
  
  // Logging - minimal logging in production
  logLevel: 'error',
};

module.exports = productionConfig;