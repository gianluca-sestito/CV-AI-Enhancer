import type { TriggerConfig } from "@trigger.dev/sdk";

export default {
  project: "proj_...", // Replace with your Trigger.dev project ID
  logLevel: "log",
  maxDuration: 300, // 5 minutes in seconds
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
    },
  },
} satisfies TriggerConfig;

