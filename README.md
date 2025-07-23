# @trump-fun/torus-clients

Open source clients for the Trump.fun Torus agents

# Installation

```bash
npm install @trump-fun/torus-clients
```

### prediction-detector

- **Purpose**:Lightweight LLM classifier step that tells you if the provided text, texts, or X posts contain a prediction to filter out irrelevant content
- **Address**: 5GEUxJ9TpLQHfbaUAMx6RB4iJ2duLY7oswaXqn9rcEpAvWKQ
- **Local Port**: 3002
- **Supported interfaces**: REST, Torus AgentServer
- **Notion**: [Here, has reference curls and reference AgentClient code](https://www.notion.so/prediction-detector-23390dd606c180f48ec5da3eb3398078)
- **Example usage**:

```ts
// Make sure to install "@trump-fun/torus-clients"

//I'll format this tomorrow

// Detect predictions in text
const response = await client.text({
  text,
  model, //openrouter, default is openai/gpt-4.1-mini
});

//Detect predictions in multiple texts at once
const response = await client.textBatch({
  texts,
  model, //openrouter, default is openai/gpt-4.1-mini
});

//Detect predictions in X posts
const response3 = await client.x({ postIds, model });
```

### author-scorer-and-bot-detector

- **Purpose**: Classification step that gives you a quality score for a given content creator and tells you the likelihood that the user is a bot
- **Address**: 5FCKLnjXSR8Dwe6AS93tnGvnAmDsnNqivvfWcjjsFEBC4i4V
- **Remote address**: https://real-trump.fun/torus/bot-detector
- **Supported interfaces**: REST, Torus AgentServer
- **Notion**: [Here, has reference curls and reference AgentClient code, TODO reference agent client code in Notion is outdated, see reference below, its current](https://www.notion.so/author-scorer-and-bot-detector-23390dd606c180f48ec5da3eb3398078)
- **Example usage**:

```ts
// Make sure to install "@trump-fun/torus-clients"

const botDetectorClient = new BotDetectorClient(mnemonic, 'https://real-trump.fun/torus/bot-detector');

const response = await botDetectorClient.scoreAuthor({
  entityId: '44196397', // elonmusk's id
  model: 'openai/gpt-4.1-mini', //openrouter, default is openai/gpt-4.1-mini
  platform: 'x',
  options: {
    forceRecheck: false, //Bypass the cache to force a re-check, default is false, please use with caution
    skipContentCheck: false, //Skip investigating post content check for a quick response, default is false
  },
});

// Can score by username instead of id if you want
const response2 = await client.scoreAuthor({
  entityUsername: 'elonmusk',
  model: 'openai/gpt-4.1-mini', //openrouter, default is openai/gpt-4.1-mini
  platform: 'x',
  options: {
    forceRecheck: false, //Bypass the cache to force a re-check, default is false, please use with caution
    skipContentCheck: false, //Skip investigating post content check for a quick response, default is false
  },
});

// Also have a batch function for classifying multiple users at once
const response3 = await botDetectorClient.scoreAuthorBatch({
  entityIds: ['44196397', '295218901'], // Elon, Vitalik,
  model: 'openai/gpt-4.1-mini', //openrouter, default is openai/gpt-4.1-mini
  platform: 'x',
  options: {
    forceRecheck: false, //Bypass the cache to force a re-check, default is false, please use with caution
    skipContentCheck: false, //Skip investigating post content check for a quick response, default is false
  },
});

// Batch also supports usernames
const response4 = await client.scoreAuthorBatch({
  entityUsernames: ['elonmusk', 'VitalikButerin'],
  model: 'openai/gpt-4.1-mini', //openrouter, default is openai/gpt-4.1-mini
  platform: 'x',
  options: {
    forceRecheck: false, //Bypass the cache to force a re-check, default is false, please use with caution
    skipContentCheck: false, //Skip investigating post content check for a quick response, default is false
  },
});
```

### english-detector

- **Purpose**: Classification step that checks if the provided text is in english to save on LLM tokens
- **Address**: 5FCKLnjXSR8Dwe6AS93tnGvnAmDsnNqivvfWcjjsFEBC4i4V
- **Local Port**: NOT_PUBLISHED
- **Supported interfaces**: REST, Torus AgentServer
- **Notion**: [Here, has reference curls and reference AgentClient code](https://www.notion.so/english-detector-23390dd606c180a2ade7cf53bd4f631d)
- **Example usage**:

```ts
//TODO, english detector is in its own repo and I need to integrate it into my monorepo/framework.
// The AgentServer version isn't deployed yet, but the legacy REST API version is so its usable if you want to use it.
```

### the-great-image-interrogator

- **Purpose**: Performs common image analysis tasks such as OCR, label and object detection, celebrity recognition, and LLM captioning
- **Address**: 5HVXyScRKkC5hvJ3VhWmD1UGdy1YXgAHLTpR63XpA8YcNBaY
- **Remote address**: https://real-trump.fun/torus/image-analysis
- **Supported interfaces**: REST, MCP
- **Notion**: [Here, has reference curls and MCP examples and instructions](https://www.notion.so/the-great-image-interrogator-23390dd606c18076bbd4e93df0a23564). This one uniquely [also has Swagger docs here](https://real-trump.fun/image-analysis/)
- **Example usage**:

```ts
//TODO, image analysis is in its own repo and isn't using AgentServer and I need to integrate it into my monorepo/framework.

//The AgentServer version isn't deployed yet, but the legacy REST API version and MCP version is if you want to use it.
```

### prediction-verifier

- **Purpose**: Checks if a given prediction was correct or not after the fact
- **Address**: 5GKvHYoaKKr6jWYM7FiUY6i7JZsaUfXrCdfEhFL89BxnCTCB
- **Remote address**: https://real-trump.fun/torus/prediction-verifier
- **Supported interfaces**: AgentServer
- **Notion**: [Here, has reference curls and MCP examples and instructions](https://www.notion.so/prediction-verifier-23390dd606c1808f9d33fa66611c3c6f). TODO on linking to source code and schemas.
- **Example usage**:

```ts
// Make sure to install "@trump-fun/torus-clients"
const verifierClient = new PredictionVerifierClient(mnemonic, 'https://real-trump.fun/torus/prediction-verifier');

// Fetch then verify a prediction from the swarm memory, then insert a claim into the swarm memory
const response = await verifierClient.verifySwarmPrediction({
  predictionId: 1,
});

// Verify a raw prediction, no impact on swarm memory
const response2 = await verifierClient.verifyRawPrediction({
  prediction: 'I predict BTC will be $100,000 by the end of the 2025',
});

// Note: The agent also has a "scheduled" method, but that's an intentionally private method for a scheduled job, so reference code has been omitted.
```

- **Note**: This is the agent as it was submitted to the Imperial Blockchain Hackathon this year. It's just a PoC and will undergo heavy changes in the coming few weeks.

### openrouter-router

- **Purpose**: Routes requests to a managed openrouter model
- **Address**: 5EexhTdfBsLVE99HGS5mQEMj86FoejXHmhZstKajEX8CvotT
- **Remote address**: https://real-trump.fun/torus/openrouter-router
- **Supported interfaces**: AgentServer
- **Example usage**:

```ts
// Make sure to install "@trump-fun/torus-clients"
const client = new OpenrouterRouterClient(mnemonic, 'https://real-trump.fun/torus/openrouter-router');

// See schema at bottom. OR, tl;dr, all parameters supported by openrouter's /completions endpoint are supported by this client: https://openrouter.ai/docs/api-reference/completion
const response = await client.completions({
  prompt: 'Say hi to the humans',
  model: 'openai/gpt-4.1-mini',
});

// See schema at bottom. OR, tl;dr, all parameters supported by openrouter's /chat/completions endpoint are supported by this client: https://openrouter.ai/docs/api-reference/chat-completion
const response2 = await client.chatCompletions({
  messages: [
    {
      role: 'user',
      content: 'Say hi to the humans',
    },
  ],
  model: 'openai/gpt-4.1-mini',
});
```

### prediction-finder

- **Purpose**: Finds predictions on X and stores them in the swarm memory
- **Address**: 5ExhSX83sbkorNwpBTZL3pBxX6PDMB2kKZjvwkMxpNKCP2Yh
- **Remote address**: https://real-trump.fun/torus/prediction-finder
- **Supported interfaces**: AgentServer
- **Notion**: NO_NOTION_PAGE_YET
- **Example usage**:

```ts
// Make sure to install "@trump-fun/torus-clients"
// Provide an advanced search query for X and the agent will find predictions and store them in the swarm memory
const response = await client.findPredictionsOnDemand({
  query,
  platform: 'x',
});

// The other function, "scheduled" is run by a job that periodically scrapes X for predictions for the swarm, and isn't exposed to the public.
```

### verdict-reasoning

- **Purpose**: Analyzes a predictions verification claims and upserts a verdict to the swarm memory
- **Address**: 5HTkSenPbzHNHSajcczw9jdXmAAopZ95crVPKpHw1wi4qdY5
- **Remote address**: https://real-trump.fun/torus/verdict-reasoning
- **Supported interfaces**: AgentServer
- **Example usage**:

```ts
//TODO, agent isn't deployed as of writing, expected to launch 07/22/2025-07/23/2025
```

# Raw client dump

## This is here temporarily until I move the clients package to a public package in case you don't want to install @trump-fun/torus-clients

## prediction-finder

```ts
import { AgentClient, Keypair } from '@torus-network/sdk/agent-client';
import { type PredictionFinderOnDemandInputSchema, type PredictionFinderScheduledInputSchema } from '@trump-fun/torus-clients';

export class PredictionFinderClient {
  private client: AgentClient;

  // Pass your own mnemonic here to use the prediction finder agent as your own agent
  constructor(mnemonic: string, baseUrl: string) {
    const keypair = new Keypair(mnemonic);
    this.client = new AgentClient({ keypair, baseUrl });
  }

  async findPredictionsOnDemand(input: PredictionFinderOnDemandInputSchema) {
    const response = await this.client.call({
      endpoint: 'on-demand',
      data: input,
    });

    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to call on-demand endpoint',
      };
    }
  }

  async findPredictionsScheduled(input: PredictionFinderScheduledInputSchema) {
    const response = await this.client.call({
      endpoint: 'scheduled',
      data: input,
    });

    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to call scheduled endpoint',
      };
    }
  }
}
```

## prediction-verifier

```ts
import { AgentClient, Keypair } from '@torus-network/sdk/agent-client';
import {
  type PredictionVerifierScheduledOutput,
  type PredictionVerifierVerifyRawPredictionInput,
  type PredictionVerifierVerifyRawPredictionOutput,
  type PredictionVerifierVerifySwarmPredictionInput,
  type PredictionVerifierVerifySwarmPredictionOutput,
} from '@trump-fun/torus-clients';

export class PredictionVerifierClient {
  private client: AgentClient;

  constructor(mnemonic: string, baseUrl: string) {
    const keypair = new Keypair(mnemonic);
    this.client = new AgentClient({ keypair, baseUrl });
    console.log('Prediction verifier client running against:', baseUrl);
  }

  async verifySwarmPrediction(input: PredictionVerifierVerifySwarmPredictionInput): Promise<{
    success: boolean;
    data?: PredictionVerifierVerifySwarmPredictionOutput;
    error?: string;
  }> {
    console.log('Verifying prediction:', input);
    const response = await this.client.call({
      endpoint: 'verify-swarm-prediction',
      data: input,
    });
    console.log('Verify prediction response:', response);

    if (response.success) {
      return {
        success: true,
        data: response.data as PredictionVerifierVerifySwarmPredictionOutput,
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to verify prediction',
      };
    }
  }

  async verifyRawPrediction(input: PredictionVerifierVerifyRawPredictionInput): Promise<{
    success: boolean;
    data?: PredictionVerifierVerifyRawPredictionOutput;
    error?: string;
  }> {
    console.log('Verifying raw prediction:', input);
    const response = await this.client.call({
      endpoint: 'verify-raw-prediction',
      data: input,
    });
    console.log('Verify raw prediction response:', response);

    if (response.success) {
      return {
        success: true,
        data: response.data as PredictionVerifierVerifyRawPredictionOutput,
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to verify raw prediction',
      };
    }
  }

  async scheduled(): Promise<{
    success: boolean;
    data?: PredictionVerifierScheduledOutput;
    error?: string;
  }> {
    console.log('Running scheduled verification');
    const response = await this.client.call({
      endpoint: 'scheduled',
      data: {},
    });
    console.log('Scheduled verification response:', response);

    if (response.success) {
      return {
        success: true,
        data: response.data as PredictionVerifierScheduledOutput,
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to run scheduled verification',
      };
    }
  }
}
```

## author-scorer-and-bot-detector

```ts
// This is a reference Torus SDK client for the bot detection/author scoring service
import { AgentClient, Keypair } from '@torus-network/sdk/agent-client';
import {
  AuthorScorerScoreAuthorBatchInputSchema,
  AuthorScorerScoreAuthorBatchOutputSchema,
  AuthorScorerScoreAuthorInputSchema,
  AuthorScorerScoreAuthorOutputSchema,
} from '@trump-fun/torus-clients';

export class BotDetectorClient {
  private client: AgentClient;

  // Pass your own mnemonic here to use the bot detector agent as your own agent
  constructor(mnemonic: string, baseUrl: string) {
    const keypair = new Keypair(mnemonic);
    this.client = new AgentClient({ keypair, baseUrl });
  }

  async scoreAuthor(input: AuthorScorerScoreAuthorInputSchema) {
    console.log('Score author', input);
    const response = await this.client.call({
      endpoint: 'score-author',
      data: input,
    });

    if (response.success) {
      console.log('Score author success', response.data);
      return {
        success: true,
        data: response.data as AuthorScorerScoreAuthorOutputSchema,
      };
    } else {
      console.log('Score author error', response.error);
      const errorMessage = (response.error as any)?.error || response.error?.message || 'Failed to score author';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async scoreAuthorBatch(input: AuthorScorerScoreAuthorBatchInputSchema) {
    console.log('Scoring author batch', input);
    const response = await this.client.call({
      endpoint: 'score-author-batch',
      data: input,
    });

    if (response.success) {
      console.log('Scoring author batch success', response.data);
      return {
        success: true,
        results: response.data as AuthorScorerScoreAuthorBatchOutputSchema,
      };
    } else {
      console.log('Scoring author batch error', response.error);
      const errorMessage = (response.error as any)?.error || response.error?.message || 'Failed to batch score authors';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
```

## prediction-detector

```ts
// This is a reference Torus SDK client for the prediction detection service
import { AgentClient, Keypair } from '@torus-network/sdk/agent-client';
import {
  type PredictionDetectorTextBatchInputSchema,
  type PredictionDetectorTextBatchOutputSchema,
  type PredictionDetectorTextInputSchema,
  type PredictionDetectorTextOutputSchema,
  type PredictionDetectorXInputSchema,
  type PredictionDetectorXOutputSchema,
} from '@trump-fun/torus-clients';

export class PredictionDetectorClient {
  private client: AgentClient;

  // Pass your own mnemonic here to use the prediction detector agent as your own agent
  constructor(mnemonic: string, baseUrl: string) {
    const keypair = new Keypair(mnemonic);
    this.client = new AgentClient({ keypair, baseUrl });
  }

  async text(input: PredictionDetectorTextInputSchema) {
    const response = await this.client.call({
      method: 'POST',
      endpoint: 'text',
      data: input,
    });

    if (response.success) {
      return {
        success: true,
        data: response.data as PredictionDetectorTextOutputSchema,
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to classify text',
      };
    }
  }

  async textBatch(input: PredictionDetectorTextBatchInputSchema) {
    const response = await this.client.call({
      method: 'POST',
      endpoint: 'text.batch',
      data: input,
    });

    if (response.success) {
      return {
        success: true,
        results: response.data as PredictionDetectorTextBatchOutputSchema,
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to batch classify texts',
      };
    }
  }

  async x(input: PredictionDetectorXInputSchema) {
    const response = await this.client.call({
      method: 'POST',
      endpoint: 'x',
      data: input,
    });

    if (response.success) {
      return {
        success: true,
        results: response.data as PredictionDetectorXOutputSchema,
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to classify X posts',
      };
    }
  }
}
```

## openrouter-router

```ts
import { AgentClient, Keypair } from '@torus-network/sdk/agent-client';
import {
  type OpenrouterChatCompletionsInput,
  type OpenrouterChatCompletionsOutput,
  type OpenrouterCompletionsInput,
  type OpenrouterCompletionsOutput,
} from '@trump-fun/torus-clients';

export class OpenrouterRouterClient {
  private client: AgentClient;

  constructor(mnemonic: string, baseUrl: string) {
    const keypair = new Keypair(mnemonic);
    this.client = new AgentClient({ keypair, baseUrl });
  }

  async completions(input: OpenrouterCompletionsInput): Promise<{
    success: boolean;
    data?: OpenrouterCompletionsOutput;
    error?: string;
  }> {
    const response = await this.client.call({
      endpoint: 'completions',
      data: input,
    });

    if (response.success) {
      return {
        success: true,
        data: response.data as OpenrouterCompletionsOutput,
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to call completions endpoint',
      };
    }
  }

  async chatCompletions(input: OpenrouterChatCompletionsInput): Promise<{
    success: boolean;
    data?: OpenrouterChatCompletionsOutput;
    error?: string;
  }> {
    const response = await this.client.call({
      endpoint: 'chat-completions',
      data: input,
    });

    if (response.success) {
      return {
        success: true,
        data: response.data as OpenrouterChatCompletionsOutput,
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to call chat-completions endpoint',
      };
    }
  }
}
```

# Schema dump

## This is here temporarily until I move the torus-clients package to a public package

## prediction-finder

```ts
import z from 'zod';

export const predictionFinderOnDemandInputSchema = z.object({
  query: z.string().describe('The search query for finding predictions.'),
  platform: z.enum(['x', 'twitter']).describe('The platform to search on. Currently only "x" and "twitter" are supported.'),
});

export const predictionFinderScheduledInputSchema = z.object({}).describe('Input for the scheduled prediction finder. Takes no arguments.');

export type PredictionFinderOnDemandInputSchema = z.infer<typeof predictionFinderOnDemandInputSchema>;

export type PredictionFinderScheduledInputSchema = z.infer<typeof predictionFinderScheduledInputSchema>;

export const predictionFinderOnDemandOutputSchema = z.object({
  status: z.string(),
});

export const predictionFinderScheduledOutputSchema = z.object({
  status: z.string(),
});

export type PredictionFinderOnDemandOutputSchema = z.infer<typeof predictionFinderOnDemandOutputSchema>;

export type PredictionFinderScheduledOutputSchema = z.infer<typeof predictionFinderScheduledOutputSchema>;
```

## prediction-verifier

```ts
import { z } from 'zod';

export enum PredictionOutcome {
  NotMatured = 'NotMatured',
  MaturedTrue = 'MaturedTrue',
  MaturedFalse = 'MaturedFalse',
  MaturedMostlyTrue = 'MaturedMostlyTrue',
  Unverifiable = 'Unverifiable',
}

export const predictionVerifierVerifySwarmPredictionInputSchema = z.object({
  predictionId: z.number().describe('The swarm memory prediction id to fetch, verify, and create a prediction claim for'),
});

export const predictionVerifierVerifyRawPredictionInputSchema = z.object({
  prediction: z.string().describe('the prediction text to verify'),
  context: z.record(z.string(), z.any()).optional(),
});

const baseVerificationOutputSchema = z.object({
  prediction: z.string().describe('The prediction text that was processed'),
  outcome: z.nativeEnum(PredictionOutcome).describe('The outcome of the prediction verification process'),
  proof: z
    .string()
    .describe(
      'The proof for the verification claim (markdown text containing data, links to sources, reasoning). If outcome is MostlyTrue or Unverifiable, the proof should contain details about which parts of the prediction are true/false/unverifiable.',
    ),
});

export const predictionVerifierVerifyRawPredictionOutputSchema = baseVerificationOutputSchema;

export const predictionVerifierScheduledInputSchema = z.object({});

export const predictionVerifierVerifySwarmPredictionOutputSchema = baseVerificationOutputSchema.extend({
  prediction_id: z.number().int().describe('The ID of the prediction that this verification claim is for'),
  full_post: z.string().optional().describe('The full post text from swarm memory'),
});

export const predictionVerifierScheduledOutputSchema = z.array(predictionVerifierVerifySwarmPredictionOutputSchema);

export type PredictionVerifierVerifySwarmPredictionInput = z.infer<typeof predictionVerifierVerifySwarmPredictionInputSchema>;
export type PredictionVerifierVerifyRawPredictionInput = z.infer<typeof predictionVerifierVerifyRawPredictionInputSchema>;
export type PredictionVerifierVerifySwarmPredictionOutput = z.infer<typeof predictionVerifierVerifySwarmPredictionOutputSchema>;
export type PredictionVerifierVerifyRawPredictionOutput = z.infer<typeof predictionVerifierVerifyRawPredictionOutputSchema>;
export type PredictionVerifierScheduledInput = z.infer<typeof predictionVerifierScheduledInputSchema>;
export type PredictionVerifierScheduledOutput = z.infer<typeof predictionVerifierScheduledOutputSchema>;
```

## author-scorer-and-bot-detector

```ts
import z from 'zod';

export const authorScorerScoreAuthorInputSchema = z.object({
  entityId: z.string().optional().describe('The user ID of the entity.'),
  entityUsername: z.string().optional().describe('The username of the entity.'),
  platform: z.enum(['x', 'twitter']).default('x'),
  model: z.string().optional().default('openai/gpt-4.1-mini').describe('The OpenRouter model name to use, e.g., "openai/gpt-4.1-mini".'),
  options: z
    .object({
      forceRecheck: z.boolean().default(false),
      skipContentCheck: z.boolean().default(true),
    })
    .optional(),
});

export const authorScorerScoreAuthorBatchInputSchema = z
  .object({
    entityIds: z.array(z.string()).optional().describe('An array of user IDs to check.'),
    entityUsernames: z.array(z.string()).optional().describe('An array of usernames to check.'),
    platform: z.enum(['x', 'twitter']).default('x'),
    model: z.string().optional().default('openai/gpt-4.1-mini').describe('The OpenRouter model name to use, e.g., "openai/gpt-4.1-mini".'),
    options: z
      .object({
        forceRecheck: z.boolean().default(false),
        skipContentCheck: z.boolean().default(true),
      })
      .optional(),
  })
  .refine((data) => (data.entityIds && !data.entityUsernames) || (!data.entityIds && data.entityUsernames), {
    message: 'Either entityIds or entityUsernames must be provided, but not both.',
    path: [],
  });
export type AuthorScorerScoreAuthorInputSchema = z.infer<typeof authorScorerScoreAuthorInputSchema>;
export type AuthorScorerScoreAuthorBatchInputSchema = z.infer<typeof authorScorerScoreAuthorBatchInputSchema>;

export const authorScorerScoreAuthorOutputSchema = z.object({
  entityId: z.string(),
  qualityScore: z.number(),
  botLikelihood: z.number(),
  error: z.string().nullable(),
});

export const authorScorerScoreAuthorBatchOutputSchema = z.array(authorScorerScoreAuthorOutputSchema);

export type AuthorScorerScoreAuthorOutputSchema = z.infer<typeof authorScorerScoreAuthorOutputSchema>;

export type AuthorScorerScoreAuthorBatchOutputSchema = z.infer<typeof authorScorerScoreAuthorBatchOutputSchema>;
```

## prediction-detector

```ts
import z from 'zod';

export const predictionDetectorTextInputSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty').describe('The text to check for predictionness'),
  model: z.string().optional().default('openai/gpt-4.1-mini').describe('The OpenRouter model name to use, e.g., "openai/gpt-4.1-mini".'),
});

export const predictionDetectorTextBatchInputSchema = z.object({
  texts: z.array(z.string().min(1)).min(1, 'Texts array cannot be empty').describe('An array of texts to check for predictionness'),
  model: z.string().optional().default('openai/gpt-4.1-mini').describe('The OpenRouter model name to use, e.g., "openai/gpt-4.1-mini".'),
});

export const predictionDetectorXInputSchema = z.object({
  postIds: z.string().min(1, 'postIds cannot be empty').describe('A comma-separated list of tweet IDs to classify.'),
  model: z.string().optional().default('openai/gpt-4.1-mini').describe('The OpenRouter model name to use, e.g., "openai/gpt-4.1-mini".'),
});
// This is entrypoint neutral, all functions return this or an array of this.
export const predictionDetectorSingleItemOutputSchema = z.object({
  prediction: z.boolean().describe('Whether the text contains a prediction about the future'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('The confidence of the prediction on a scale of 0 to 1, where 1 is very confident and 0 is not confident at all.'),
  reasoning: z.string().describe('A concise explanation for the classification, no more than 150 words.'),
  full_post: z.string(),
  predictions: z.array(z.string()),
  error: z.string().optional(),
});

// Put here since people intuitively would expect it given convention of other exported schemas
export const predictionDetectorTextOutputSchema = predictionDetectorSingleItemOutputSchema;

export const predictionDetectorTextBatchOutputSchema = z.array(predictionDetectorSingleItemOutputSchema);

export const predictionDetectorXOutputSchema = z.array(
  predictionDetectorSingleItemOutputSchema.extend({
    postId: z.string(),
  }),
);

export type PredictionDetectorSingleItemOutputSchema = z.infer<typeof predictionDetectorSingleItemOutputSchema>;

export type PredictionDetectorTextInputSchema = z.infer<typeof predictionDetectorTextInputSchema>;

export type PredictionDetectorTextBatchInputSchema = z.infer<typeof predictionDetectorTextBatchInputSchema>;

export type PredictionDetectorXInputSchema = z.infer<typeof predictionDetectorXInputSchema>;

export type PredictionDetectorTextOutputSchema = z.infer<typeof predictionDetectorTextOutputSchema>;
export type PredictionDetectorTextBatchOutputSchema = z.infer<typeof predictionDetectorTextBatchOutputSchema>;
export type PredictionDetectorXOutputSchema = z.infer<typeof predictionDetectorXOutputSchema>;
//TODO Clean me up, only used in one place
export type PredictionDetectorXOutputSchemaSingle = z.infer<typeof predictionDetectorXOutputSchema>[number];
```

## openrouter-router

```ts
import { z } from 'zod';

const baseOpenrouterInput = {
  models: z.array(z.string()).optional().describe('Alternate list of models for routing overrides.'),
  provider: z
    .object({
      sort: z.string().optional().describe('Sort preference (e.g., price, throughput).'),
    })
    .optional()
    .describe('Preferences for provider routing.'),
  reasoning: z
    .object({
      effort: z.enum(['high', 'medium', 'low']).optional().describe('OpenAI-style reasoning effort setting'),
      max_tokens: z
        .number()
        .int()
        .optional()
        .describe('Non-OpenAI-style reasoning effort setting. Cannot be used simultaneously with effort.'),
      exclude: z.boolean().optional().default(false).describe('Whether to exclude reasoning from the response'),
    })
    .optional()
    .describe('Configuration for model reasoning/thinking tokens'),
  usage: z
    .object({
      include: z.boolean().optional().describe('Whether to include usage information in the response'),
    })
    .optional()
    .describe('Whether to include usage information in the response'),
  transforms: z.array(z.string()).optional().describe('List of prompt transforms (OpenRouter-only).'),
  stream: z.boolean().optional().default(false).describe('Enable streaming of results.'),
  max_tokens: z.number().int().optional().describe('Maximum number of tokens (range: [1, context_length)).'),
  temperature: z.number().optional().describe('Sampling temperature (range: [0, 2]).'),
  seed: z.number().int().optional().describe('Seed for deterministic outputs.'),
  top_p: z.number().optional().describe('Top-p sampling value (range: (0, 1]).'),
  top_k: z.number().int().optional().describe('Top-k sampling value (range: [1, Infinity)).'),
  frequency_penalty: z.number().optional().describe('Frequency penalty (range: [-2, 2]).'),
  presence_penalty: z.number().optional().describe('Presence penalty (range: [-2, 2]).'),
  repetition_penalty: z.number().optional().describe('Repetition penalty (range: (0, 2]).'),
  logit_bias: z.record(z.string(), z.number()).optional().describe('Mapping of token IDs to bias values.'),
  top_logprobs: z.number().int().optional().describe('Number of top log probabilities to return.'),
  min_p: z.number().optional().describe('Minimum probability threshold (range: [0, 1]).'),
  top_a: z.number().optional().describe('Alternate top sampling parameter (range: [0, 1]).'),
  user: z.string().optional().describe('A stable identifier for your end-users. Used to help detect and prevent abuse.'),
};

const refinement = (data: { reasoning?: { effort?: string; max_tokens?: number } }) =>
  !(data.reasoning && data.reasoning.effort && data.reasoning.max_tokens !== undefined);
const refinementMessage = {
  message: 'Cannot use both effort and max_tokens in reasoning',
  path: ['reasoning'],
};

export const openrouterCompletionsInputSchema = z
  .object({
    model: z.string().describe("The model ID to use. If unspecified, the user's default is used."),
    prompt: z.string().describe('The text prompt to complete'),
    ...baseOpenrouterInput,
  })
  .refine(refinement, refinementMessage);

export const openrouterChatCompletionsInputSchema = z
  .object({
    model: z.string().describe("The model ID to use. If unspecified, the user's default is used."),
    messages: z.array(
      z.object({
        role: z.enum(['system', 'developer', 'user', 'assistant', 'tool']),
        content: z.string(),
      }),
    ),
    ...baseOpenrouterInput,
  })
  .refine(refinement, refinementMessage);

export type OpenrouterCompletionsInput = z.infer<typeof openrouterCompletionsInputSchema>;

export type OpenrouterChatCompletionsInput = z.infer<typeof openrouterChatCompletionsInputSchema>;

export const openrouterCompletionsOutputSchema = z
  .object({
    id: z.string().nullable(),
    choices: z
      .array(
        z
          .object({
            text: z.string().nullable(),
            index: z.number().int().optional(),
            finish_reason: z.string().nullable(),
          })
          .passthrough(),
      )
      .nullable(),
  })
  .passthrough();

export const openrouterChatCompletionsOutputSchema = z
  .object({
    id: z.string().nullable(),
    choices: z
      .array(
        z
          .object({
            message: z
              .object({
                role: z.string().nullable(),
                content: z.string().nullable(),
              })
              .passthrough()
              .nullable(),
          })
          .passthrough(),
      )
      .nullable(),
  })
  .passthrough();

export type OpenrouterCompletionsOutput = z.infer<typeof openrouterCompletionsOutputSchema>;

export type OpenrouterChatCompletionsOutput = z.infer<typeof openrouterChatCompletionsOutputSchema>;
```
