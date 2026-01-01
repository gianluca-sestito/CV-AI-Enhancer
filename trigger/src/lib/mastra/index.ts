import { Mastra } from "@mastra/core/mastra";
import { analysisAgent } from "./agents/analysisAgent";
import { cvGenerationAgent } from "./agents/cvGenerationAgent";

export const mastra = new Mastra({
  agents: {
    analysisAgent,
    cvGenerationAgent,
  },
});

