import { Mastra } from "@mastra/core/mastra";
import { analysisAgent } from "./agents/analysisAgent";
import { cvGenerationAgent } from "./agents/cvGenerationAgent";
import { structureAgent } from "./agents/structureAgent";
import { contentAgent } from "./agents/contentAgent";
import { importAgent } from "./agents/importAgent";

export const mastra = new Mastra({
  agents: {
    analysisAgent,
    cvGenerationAgent,
    structureAgent,
    contentAgent,
    importAgent,
  },
});

