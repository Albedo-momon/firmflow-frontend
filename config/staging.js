/**
 * Staging Environment Configuration
 * 
 * Configuration overrides for staging environment.
 * Inherits from default.js and can be overridden by environment variables.
 */

module.exports = {
  // Environment
  env: 'staging',
  
  // API Configuration
  apiBase: 'https://staging-api.firmflow.in',
  
  // LLM Provider
  llmProvider: 'anthropic', // Use real LLM in staging
  
  // Development Features
  enableDevMode: true, // Keep dev features in staging for testing
  
  // Analytics
  analyticsEnabled: false, // Disable analytics in staging
  
  // Third-party Services (use test keys)
  stripePublicKey: '', // Add staging Stripe key if needed
  sentryDsn: '', // Add staging Sentry DSN if needed
  
  // Feature Flags
  featureFlags: {
    showRawExtraction: true, // Show debug info in staging
    enableAdvancedFilters: true, // Test advanced features
    showDebugInfo: true,
  },
  
  // Performance Settings
  maxPollingIntervalMs: 15000, // Faster polling for testing
  
  // Logging
  logLevel: 'info', // Less verbose than development
};