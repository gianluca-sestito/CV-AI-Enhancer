# Langfuse Implementation Guide

This document explains how Langfuse is integrated into this project for AI observability and LLM tracing. Use this guide to replicate the exact same implementation in another project.

## Overview

Langfuse is integrated through the Mastra framework's observability system. It provides automatic tracing of all LLM calls made through Mastra agents, capturing:

- Agent execution traces
- LLM API calls (prompts, responses, tokens, latency)
- Tool invocations
- Error tracking
- Performance metrics

## Implementation Details

### 1. Package Dependencies

The project uses the `@mastra/langfuse` package which provides the Langfuse exporter for Mastra:

```json
{
  "dependencies": {
    "@mastra/core": "^0.23.3",
    "@mastra/langfuse": "^0.2.3"
  }
}
```

**Installation:**

```bash
bun add @mastra/core @mastra/langfuse
# or
npm install @mastra/core @mastra/langfuse
# or
yarn add @mastra/core @mastra/langfuse
```

### 2. Environment Variables

Three environment variables are required (all optional - implementation gracefully degrades if not set):

```env
# Required for Langfuse to work
LANGFUSE_PUBLIC_KEY=pk-...          # Your Langfuse public API key
LANGFUSE_SECRET_KEY=sk-...          # Your Langfuse secret key

# Optional - defaults to https://cloud.langfuse.com if not provided
LANGFUSE_BASE_URL=https://cloud.langfuse.com  # Or your self-hosted instance URL
```

**Where to get these:**

1. Sign up at <https://cloud.langfuse.com> or set up self-hosted instance
2. Navigate to Settings → API Keys
3. Create a new API key pair (public + secret)

### 3. Core Implementation

The implementation is located in `trigger/src/lib/mastra/index.ts`. Here's the complete pattern:

```typescript
import { Mastra } from "@mastra/core/mastra";
import { LangfuseExporter } from "@mastra/langfuse";
import { analysisAgent } from "./agents/analysisAgent";
import { cvGenerationAgent } from "./agents/cvGenerationAgent";
// ... other agent imports

// Step 1: Read environment variables
const langfusePublicKey = process.env.LANGFUSE_PUBLIC_KEY;
const langfuseSecretKey = process.env.LANGFUSE_SECRET_KEY;
const langfuseBaseUrl = process.env.LANGFUSE_BASE_URL;

// Step 2: Define the observability config type
type ObservabilityConfig = {
  serviceName: string;
  exporters: LangfuseExporter[];
};

// Step 3: Conditionally build observability configs
const observabilityConfigs: Record<string, ObservabilityConfig> = {};

// Only configure Langfuse if credentials are present
if (langfusePublicKey && langfuseSecretKey) {
  observabilityConfigs.langfuse = {
    serviceName: "cv-ai-enhancer", // Your service name
    exporters: [
      new LangfuseExporter({
        publicKey: langfusePublicKey,
        secretKey: langfuseSecretKey,
        baseUrl: langfuseBaseUrl, // Optional, defaults to cloud.langfuse.com
        realtime: process.env.NODE_ENV === "development", // Enable realtime in dev
        options: {
          environment: process.env.NODE_ENV || "development",
        },
      }),
    ],
  };
}

// Step 4: Initialize Mastra with observability
export const mastra = new Mastra({
  agents: {
    analysisAgent,
    cvGenerationAgent,
    // ... other agents
  },
  observability: {
    configs: observabilityConfigs,
    configSelector: () => {
      // Select Langfuse config if credentials are available
      if (langfusePublicKey && langfuseSecretKey) {
        return "langfuse";
      }
      // Return undefined to disable observability if not configured
      return undefined;
    },
  },
});
```

### 4. Key Implementation Patterns

#### Conditional Configuration
The implementation uses **conditional configuration** - Langfuse is only enabled if both `LANGFUSE_PUBLIC_KEY` and `LANGFUSE_SECRET_KEY` are present. This allows the application to work without Langfuse (graceful degradation).

#### Realtime Mode
Realtime tracing is enabled in development mode:
```typescript
realtime: process.env.NODE_ENV === "development"
```
This provides immediate visibility during development. In production, traces are batched for better performance.

#### Environment Tagging
The implementation tags traces with the environment:
```typescript
options: {
  environment: process.env.NODE_ENV || "development",
}
```
This allows filtering traces by environment in the Langfuse dashboard.

#### Config Selector Pattern
The `configSelector` function dynamically selects which observability config to use. This pattern allows:
- Multiple observability backends (Langfuse, custom exporters, etc.)
- Runtime configuration switching
- Graceful fallback when observability is not configured

### 5. How It Works

Once configured, Langfuse automatically captures:

1. **Agent Executions**: Every time an agent is invoked via `mastra.agents.agentName.generate()` or similar methods
2. **LLM Calls**: All API calls to the underlying LLM (OpenAI, etc.)
3. **Tool Invocations**: When agents use tools
4. **Metadata**: 
   - Timestamps
   - Token usage
   - Latency
   - Model used
   - Environment
   - Service name

**No code changes needed in agents** - the observability is transparent and automatic.

### 6. Usage Example

Agents are used normally - observability happens automatically:

```typescript
import { mastra } from "./lib/mastra";

// This call is automatically traced by Langfuse
const result = await mastra.agents.analysisAgent.generate({
  messages: [
    { role: "user", content: "Analyze this job description..." }
  ]
});

// All LLM calls, token usage, latency, etc. are captured
```

### 7. Viewing Traces

1. Go to your Langfuse dashboard (cloud.langfuse.com or your self-hosted URL)
2. Navigate to "Traces" or "Sessions"
3. Filter by:
   - Environment (development/production)
   - Service name ("cv-ai-enhancer")
   - Date range
   - Agent name

### 8. Complete File Structure

```
trigger/src/lib/mastra/
├── index.ts              # Main Mastra instance with Langfuse config
├── agents/
│   ├── analysisAgent.ts
│   ├── cvGenerationAgent.ts
│   └── ...               # Other agents (no changes needed)
└── tools/
    └── ...               # Tools (no changes needed)
```

## Replication Checklist

To replicate this implementation in another project:

- [ ] Install dependencies: `@mastra/core` and `@mastra/langfuse`
- [ ] Set environment variables: `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_BASE_URL` (optional)
- [ ] Import `LangfuseExporter` from `@mastra/langfuse`
- [ ] Read environment variables at module level
- [ ] Create `observabilityConfigs` object (empty by default)
- [ ] Conditionally add Langfuse config if credentials exist
- [ ] Initialize Mastra with `observability.configs` and `observability.configSelector`
- [ ] Set `serviceName` to your application name
- [ ] Configure `realtime` based on environment (true for dev, false for prod)
- [ ] Add environment tagging in `options.environment`
- [ ] Test that agents work with and without Langfuse credentials

## Important Notes

1. **Optional Integration**: The implementation gracefully degrades if Langfuse credentials are not provided. The application continues to work normally.

2. **No Agent Changes Required**: Once Mastra is configured with observability, all agents automatically send traces. No changes needed in agent definitions.

3. **Performance**: In production, disable `realtime: false` to batch traces for better performance.

4. **Privacy**: Ensure your Langfuse instance complies with your data privacy requirements. Consider self-hosting for sensitive data.

5. **Cost**: Langfuse Cloud has usage-based pricing. Self-hosted is free but requires infrastructure.

## Troubleshooting

**Traces not appearing:**
- Verify environment variables are set correctly
- Check that both `LANGFUSE_PUBLIC_KEY` and `LANGFUSE_SECRET_KEY` are present
- Verify API keys are valid in Langfuse dashboard
- Check network connectivity to Langfuse instance

**High latency:**
- Disable `realtime` in production
- Check Langfuse instance performance
- Verify network latency to Langfuse

**Missing traces:**
- Ensure agents are called through the `mastra` instance
- Check that `configSelector` returns "langfuse" when credentials are present
- Verify agents are registered in Mastra initialization
