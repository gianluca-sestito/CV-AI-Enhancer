import { Mastra } from "@mastra/core/mastra";
import { analysisAgent } from "./agents/analysisAgent";
import { cvGenerationAgent } from "./agents/cvGenerationAgent";
import { analysisWorkflow } from "./workflows/analysisWorkflow";
import { cvGenerationWorkflow } from "./workflows/cvGenerationWorkflow";

export const mastra = new Mastra({
  agents: {
    analysisAgent,
    cvGenerationAgent,
  },
  workflows: {
    analysisWorkflow,
    cvGenerationWorkflow,
  },
});

