import { tasks, type TaskPayload } from "@trigger.dev/sdk";
import type { analyzeJobDescription } from "@/trigger/src/tasks/analyzeJobDescription";
import type { generateTailoredCV } from "@/trigger/src/tasks/generateTailoredCV";
import type { importCV } from "@/trigger/src/tasks/importCV";

/**
 * Trigger.dev v4 SDK client for triggering tasks
 */
class TriggerClient {
  async triggerAnalysis(payload: TaskPayload<typeof analyzeJobDescription>) {
    return await tasks.trigger<typeof analyzeJobDescription>("analyze-job-description", payload);
  }

  async triggerCVGeneration(payload: TaskPayload<typeof generateTailoredCV>) {
    return await tasks.trigger<typeof generateTailoredCV>("generate-tailored-cv", payload);
  }

  async triggerCVImport(payload: TaskPayload<typeof importCV>) {
    return await tasks.trigger<typeof importCV>("import-cv", payload);
  }
}

export const triggerClient = new TriggerClient();

