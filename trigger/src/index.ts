import type { TriggerConfig } from "@trigger.dev/sdk";
import { analyzeJobDescription } from "./tasks/analyzeJobDescription";
import { generateTailoredCV } from "./tasks/generateTailoredCV";
import { importCV } from "./tasks/importCV";

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

// Export tasks
export { analyzeJobDescription, generateTailoredCV, importCV };

export const tasks = {
  analyzeJobDescription,
  generateTailoredCV,
};

