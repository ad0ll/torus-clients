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
