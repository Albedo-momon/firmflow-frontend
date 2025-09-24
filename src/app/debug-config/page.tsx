'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

// Import the config system
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getConfig } = require('../../../config');

interface ConfigDisplayProps {
  title: string;
  data: Record<string, unknown>;
  className?: string;
}

function ConfigDisplay({ title, data, className = '' }: ConfigDisplayProps) {
  return (
    <Card className={`mb-4 ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}

export default function DebugConfigPage() {
  const [currentConfig, setCurrentConfig] = useState<Record<string, unknown>>({});
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    // Get the current configuration
    const cfg = getConfig();
    setCurrentConfig(cfg);
    setIsProduction(String(cfg.env) === 'production');

    // Extract relevant environment variables
    const relevantEnvVars: Record<string, string> = {};
    Object.keys(process.env).forEach(key => {
      if (key.startsWith('NEXT_PUBLIC_') || key === 'NODE_ENV') {
        relevantEnvVars[key] = process.env[key] || '';
      }
    });
    setEnvVars(relevantEnvVars);
  }, []);

  // Don't show debug page in production
  if (isProduction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Debug configuration page is not available in production environment.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configuration Debug
          </h1>
          <p className="text-gray-600">
            Current environment: <span className="font-semibold">{String(currentConfig.env || 'unknown')}</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This page is only available in development mode. It shows the resolved configuration
            after merging default values, environment-specific overrides, and runtime environment variables.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Configuration */}
          <ConfigDisplay
            title="🔧 Resolved Configuration"
            data={currentConfig}
            className="lg:col-span-2"
          />

          {/* Environment Variables */}
          <ConfigDisplay
            title="🌍 Environment Variables"
            data={envVars}
          />

          {/* Configuration Keys Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">📋 Configuration Keys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>apiBase:</strong> Backend API URL
                </div>
                <div>
                  <strong>env:</strong> Current environment (development/production/staging)
                </div>
                <div>
                  <strong>llmProvider:</strong> LLM service provider (mock/anthropic/openai)
                </div>
                <div>
                  <strong>enableDevMode:</strong> Enable development features
                </div>
                <div>
                  <strong>analyticsEnabled:</strong> Enable analytics tracking
                </div>
                <div>
                  <strong>stripePublicKey:</strong> Stripe public key for payments
                </div>
                <div>
                  <strong>sentryDsn:</strong> Sentry DSN for error tracking
                </div>
                <div>
                  <strong>featureFlags:</strong> Feature toggle settings
                </div>
                <div>
                  <strong>maxPollingIntervalMs:</strong> Maximum polling interval
                </div>
                <div>
                  <strong>logLevel:</strong> Application log level
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">💡 Usage Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>To change configuration:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Copy <code className="bg-gray-100 px-1 rounded">.env.example</code> to <code className="bg-gray-100 px-1 rounded">.env.local</code></li>
                <li>Edit the values in <code className="bg-gray-100 px-1 rounded">.env.local</code></li>
                <li>Restart the development server</li>
                <li>Refresh this page to see the changes</li>
              </ol>
              <p className="mt-3">
                <strong>Environment variable priority:</strong> Environment variables override config files.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}