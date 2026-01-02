import { defineConfig } from '@trigger.dev/sdk'

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_ID || "proj_...", // Set TRIGGER_PROJECT_ID in your .env file
  logLevel: "log",
  maxDuration: 300, // 5 minutes in seconds
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
    },
  },
});