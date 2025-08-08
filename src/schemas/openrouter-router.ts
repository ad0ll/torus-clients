import { z } from 'zod';

const baseOpenrouterInput = {
  models: z.array(z.string()).optional().describe('Alternate list of models for routing overrides.'),
  provider: z
    .object({
      order: z.array(z.string()).optional().describe('List of provider slugs to try in order (e.g. ["anthropic", "openai"])'),
      allow_fallbacks: z.boolean().optional().default(true).describe('Whether to allow backup providers when the primary is unavailable'),
      require_parameters: z.boolean().optional().default(false).describe('Only use providers that support all parameters in your request'),
      data_collection: z
        .enum(['allow', 'deny'])
        .optional()
        .default('deny')
        .describe('Control whether to use providers that may store data'),
      only: z.array(z.string()).optional().describe('List of provider slugs to allow for this request'),
      ignore: z.array(z.string()).optional().describe('List of provider slugs to skip for this request'),
      quantizations: z.array(z.string()).optional().describe('List of quantization levels to filter by (e.g. ["int4", "int8"])'),
      sort: z.enum(['price', 'throughput']).optional().describe('Sort providers by price or throughput. (e.g. "price" or "throughput")'),
      max_price: z.number().optional().describe('The maximum pricing you want to pay for this request'),
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
  response_format: z
    .union([
      z.object(
        {
          type: z.literal('json_schema'),
          json_schema: z.object({
            schema: z.any(),
            strict: z.boolean().optional().nullable(),
            name: z.string(),
          }),
        },
        z.object({ type: z.string() }),
      ),
      z.any(),
    ])
    .optional(),
  agentName: z.string().optional(),
  step: z.string().optional(),
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

const usageSchema = z.object({
  completion_tokens: z.number().int(),
  completion_tokens_details: z.any(),
  cost: z.number(),
  cost_details: z.any(),
  prompt_tokens: z.number().int(),
  prompt_tokens_details: z.any(),
  total_tokens: z.number().int(),
});

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
    usage: usageSchema.optional(),
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
    model: z.string(),
    usage: usageSchema.optional(),
  })
  .passthrough();

export type OpenrouterCompletionsOutput = z.infer<typeof openrouterCompletionsOutputSchema>;

export type OpenrouterChatCompletionsOutput = z.infer<typeof openrouterChatCompletionsOutputSchema>;
