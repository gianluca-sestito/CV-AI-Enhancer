import { Mastra } from "@mastra/core/mastra";
import { LangfuseExporter } from "@mastra/langfuse";
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
  observability: {
    configs: {
      langfuse: {
        serviceName: "cv-ai-enhancer",
        exporters: [
          new LangfuseExporter({
            publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
            secretKey: process.env.LANGFUSE_SECRET_KEY!,
            baseUrl: process.env.LANGFUSE_BASE_URL,
            realtime: process.env.NODE_ENV === "development",
            options: {
              environment: process.env.NODE_ENV || "development",
            },
          }),
        ],
      },
    },
    configSelector: () => {
      // Use Langfuse config if environment variables are set
      if (
        process.env.LANGFUSE_PUBLIC_KEY &&
        process.env.LANGFUSE_SECRET_KEY
      ) {
        return "langfuse";
      }
      // Fallback to default if Langfuse is not configured
      return undefined;
    },
  },
});

