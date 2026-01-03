import { Mastra } from "@mastra/core/mastra";
import { LangfuseExporter } from "@mastra/langfuse";
import { analysisAgent } from "./agents/analysisAgent";
import { cvGenerationAgent } from "./agents/cvGenerationAgent";
import { structureAgent } from "./agents/structureAgent";
import { contentAgent } from "./agents/contentAgent";
import { importAgent } from "./agents/importAgent";

// Conditionally build Langfuse config only when env vars are present
const langfusePublicKey = process.env.LANGFUSE_PUBLIC_KEY;
const langfuseSecretKey = process.env.LANGFUSE_SECRET_KEY;
const langfuseBaseUrl = process.env.LANGFUSE_BASE_URL;

type ObservabilityConfig = {
  serviceName: string;
  exporters: LangfuseExporter[];
};

const observabilityConfigs: Record<string, ObservabilityConfig> = {};

if (langfusePublicKey && langfuseSecretKey) {
  observabilityConfigs.langfuse = {
    serviceName: "cv-ai-enhancer",
    exporters: [
      new LangfuseExporter({
        publicKey: langfusePublicKey,
        secretKey: langfuseSecretKey,
        baseUrl: langfuseBaseUrl,
        realtime: process.env.NODE_ENV === "development",
        options: {
          environment: process.env.NODE_ENV || "development",
        },
      }),
    ],
  };
}

export const mastra = new Mastra({
  agents: {
    analysisAgent,
    cvGenerationAgent,
    structureAgent,
    contentAgent,
    importAgent,
  },
  observability: {
    configs: observabilityConfigs,
    configSelector: () => {
      // Use Langfuse config if environment variables are set
      if (langfusePublicKey && langfuseSecretKey) {
        return "langfuse";
      }
      // Fallback to default if Langfuse is not configured
      return undefined;
    },
  },
});

