import { defineConfig } from '@trigger.dev/sdk'

export default defineConfig({
  project: "proj_zymwtxqwhqxgccftksnq", // Replace with your Trigger.dev project ID
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