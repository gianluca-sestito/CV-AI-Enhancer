import type { TriggerConfig } from "@trigger.dev/sdk";
import { analyzeJobDescription } from "./tasks/analyzeJobDescription";
import { generateTailoredCV } from "./tasks/generateTailoredCV";

export const config: TriggerConfig = {
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
};

export const tasks = {
  analyzeJobDescription,
  generateTailoredCV,
};

