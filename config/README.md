# FirmFlow Frontend Configuration System

A simple, reliable configuration system for managing environment-specific settings in the FirmFlow frontend application.

## Overview

This configuration system allows developers and testers to switch environments by editing config files or environment variables without code changes. It follows a hierarchical override pattern: **default values** → **environment-specific overrides** → **runtime environment variables**.

## File Structure

```
config/
├── index.js          # Main configuration loader
├── default.js        # Default configuration values
├── development.js    # Development environment overrides
├── production.js     # Production environment overrides
└── README.md         # This documentation
```

## Configuration Keys

| Key | Type | Description | Default | Env Variable |
|-----|------|-------------|---------|--------------|
| `apiBase` | string | Backend API base URL | `http://localhost:4000` | `NEXT_PUBLIC_API_BASE` |
| `env` | string | Environment name | `development` | `NEXT_PUBLIC_ENV` |
| `llmProvider` | string | LLM service provider | `mock` | `NEXT_PUBLIC_LLM_PROVIDER` |
| `enableDevMode` | boolean | Enable development features | `true` (dev), `false` (prod) | `NEXT_PUBLIC_ENABLE_DEV_MODE` |
| `analyticsEnabled` | boolean | Enable analytics tracking | `false` | `NEXT_PUBLIC_ANALYTICS_ENABLED` |
| `stripePublicKey` | string | Stripe public key | `""` | `NEXT_PUBLIC_STRIPE_KEY` |
| `sentryDsn` | string | Sentry DSN for error tracking | `""` | `NEXT_PUBLIC_SENTRY_DSN` |
| `featureFlags` | object | Feature toggle settings | See defaults | Various `NEXT_PUBLIC_*` |
| `maxPollingIntervalMs` | number | Maximum polling interval | `30000` | `NEXT_PUBLIC_MAX_POLLING_INTERVAL_MS` |
| `logLevel` | string | Application log level | `debug` (dev), `info` (prod) | `NEXT_PUBLIC_LOG_LEVEL` |

## Usage

### Basic Usage

```javascript
// Import the configuration
import { config } from '@/config';
// or
import { config } from '../config';

// Use configuration values
const apiUrl = `${config.apiBase}/api/documents`;
const isDevMode = config.enableDevMode;

// Access feature flags
if (config.featureFlags.showRawExtraction) {
  // Show debug information
}
```

### Dynamic Configuration Loading

```javascript
import { getConfig } from '@/config';

// Get fresh configuration (useful for testing)
const currentConfig = getConfig();
```

## Environment Configuration

### 1. Environment Detection

The system determines the environment using:
1. `process.env.NEXT_PUBLIC_ENV` (highest priority)
2. `process.env.NODE_ENV` (fallback)
3. `'development'` (default)

### 2. Configuration Merging

Configuration is merged in this order:
1. **Base**: `default.js`
2. **Environment**: `{environment}.js` (e.g., `production.js`)
3. **Runtime**: Environment variables (`NEXT_PUBLIC_*`)

### 3. Environment Variables

All environment variables must be prefixed with `NEXT_PUBLIC_` to be available in the browser.

#### Quick Setup

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your values:
   ```bash
   NEXT_PUBLIC_ENV=development
   NEXT_PUBLIC_API_BASE=http://localhost:4000
   NEXT_PUBLIC_LLM_PROVIDER=anthropic
   ```

3. Restart the development server:
   ```bash
   npm run dev
   ```

#### Environment Variable Examples

```bash
# Switch to production environment
NEXT_PUBLIC_ENV=production

# Override API base URL
NEXT_PUBLIC_API_BASE=https://api.firmflow.in

# Enable specific features
NEXT_PUBLIC_ENABLE_DEV_MODE=true
NEXT_PUBLIC_SHOW_RAW_EXTRACTION=false

# Configure third-party services
NEXT_PUBLIC_STRIPE_KEY=pk_test_...
NEXT_PUBLIC_SENTRY_DSN=https://...
```

## Adding New Environments

To add a new environment (e.g., `staging`):

1. Create `config/staging.js`:
   ```javascript
   module.exports = {
     apiBase: 'https://staging-api.firmflow.in',
     env: 'staging',
     llmProvider: 'anthropic',
     enableDevMode: true,
     analyticsEnabled: false,
     // ... other staging-specific overrides
   };
   ```

2. Set the environment variable:
   ```bash
   NEXT_PUBLIC_ENV=staging
   ```

## Development Tools

### Debug Configuration Page

Visit `/debug-config` during development to view the current resolved configuration. This page:
- Shows the final merged configuration
- Displays active environment variables
- Lists all available configuration keys
- Is automatically disabled in production

### Configuration Debugging Script

Use the npm script to print the current configuration:

```bash
npm run config:print
```

This outputs the resolved configuration to the console for debugging purposes.

## Type Safety

The configuration system includes TypeScript definitions. Import types as needed:

```typescript
import { Config } from '@/config';

function useApiConfig(): string {
  return config.apiBase;
}
```

## Best Practices

### 1. Environment Variables
- ✅ Use `NEXT_PUBLIC_*` prefix for client-side variables
- ✅ Keep secrets out of the repository
- ✅ Use `.env.local` for local development
- ❌ Never commit `.env.local` or secrets to version control

### 2. Configuration Files
- ✅ Use config files for defaults and development convenience
- ✅ Keep environment-specific files minimal (only overrides)
- ✅ Document new configuration keys
- ❌ Don't put secrets in config files

### 3. Feature Flags
- ✅ Use boolean feature flags for gradual rollouts
- ✅ Name flags descriptively (`showRawExtraction`, not `flag1`)
- ✅ Clean up unused flags regularly
- ❌ Don't use feature flags for environment-specific URLs

### 4. Testing
- ✅ Test configuration changes using `/debug-config`
- ✅ Verify environment variable overrides work
- ✅ Test both development and production builds
- ❌ Don't rely on configuration for unit tests

## Troubleshooting

### Configuration Not Updating
1. Ensure you've restarted the development server after changing `.env.local`
2. Check that environment variables have the `NEXT_PUBLIC_` prefix
3. Verify the environment variable names match exactly (case-sensitive)

### Values Not Overriding
1. Check the merge order: env vars override config files
2. Ensure boolean values are strings (`'true'`, not `true`)
3. Verify the environment is detected correctly

### Debug Steps
1. Visit `/debug-config` to see resolved configuration
2. Run `npm run config:print` to see configuration in console
3. Check browser developer tools for environment variables
4. Verify `.env.local` file exists and has correct format

## Security Considerations

- **Never commit secrets**: Use `.env.local` for sensitive values
- **Client-side exposure**: Only `NEXT_PUBLIC_*` variables are sent to the browser
- **Production safety**: Debug pages are automatically disabled in production
- **Environment isolation**: Use different API keys/URLs per environment

## Migration Guide

If migrating from hardcoded configuration:

1. **Identify hardcoded values** in your components
2. **Add keys to `default.js`** with appropriate defaults
3. **Replace hardcoded values** with `config.keyName`
4. **Add environment variables** to `.env.example`
5. **Test configuration** using `/debug-config`

Example migration:

```javascript
// Before
const API_URL = 'http://localhost:4000';

// After
import { config } from '@/config';
const API_URL = config.apiBase;
```

## Support

For questions or issues with the configuration system:
1. Check this documentation
2. Use `/debug-config` for debugging
3. Review `.env.example` for available variables
4. Check the console output from `npm run config:print`