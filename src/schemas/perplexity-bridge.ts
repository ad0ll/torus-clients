import { z } from 'zod';

export enum PerplexityModel {
  Sonar = 'sonar',
  SonarPro = 'sonar-pro',
  SonarReasoning = 'sonar-reasoning',
  SonarReasoningPro = 'sonar-reasoning-pro',
  SonarDeepResearch = 'sonar-deep-research',
}

const messageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string(),
});

export const perplexityBridgeChatCompletionsRawInputSchema = z.object({
  model: z.nativeEnum(PerplexityModel).describe('The name of the model that will complete your prompt.'),
  messages: z.array(messageSchema).describe('A list of messages comprising the conversation so far.'),
  search_mode: z.enum(['academic', 'web']).default('web').optional().describe('Controls the search mode used for the request.'),
  reasoning_effort: z
    .enum(['low', 'medium', 'high'])
    .default('medium')
    .optional()
    .describe('Controls how much computational effort the AI dedicates to each query for deep research models.'),
  max_tokens: z.number().int().optional().describe('The maximum number of completion tokens returned by the API.'),
  temperature: z.number().min(0).max(2).default(0).optional().describe('The amount of randomness in the response, valued between 0 and 2.'),
  top_p: z.number().min(0).max(1).default(0.9).optional().describe('The nucleus sampling threshold, valued between 0 and 1.'),
  search_domain_filter: z.array(z.any()).optional().describe('A list of domains to limit search results to.'),
  return_images: z.boolean().default(false).optional().describe('Determines whether search results should include images.'),
  return_related_questions: z.boolean().default(false).optional().describe('Determines whether related questions should be returned.'),
  search_recency_filter: z.string().optional().describe("Filters search results based on time (e.g., 'week', 'day')."),
  search_after_date_filter: z
    .string()
    .optional()
    .describe('Filters search results to only include content published after this date. Format should be %m/%d/%Y (e.g. 3/1/2025)'),
  response_format: z
    .object({
      type: z.enum(['json_object', 'json_schema']),
      json_schema: z.any().optional(),
    })
    .optional(),
  search_before_date_filter: z
    .string()
    .optional()
    .describe('Filters search results to only include content published before this date. Format should be %m/%d/%Y (e.g. 3/1/2025)'),
  last_updated_after_filter: z
    .string()
    .optional()
    .describe('Filters search results to only include content last updated after this date. Format should be %m/%d/%Y (e.g. 3/1/2025)'),
  last_updated_before_filter: z
    .string()
    .optional()
    .describe('Filters search results to only include content last updated before this date. Format should be %m/%d/%Y (e.g. 3/1/2025)'),
  top_k: z.number().int().default(0).optional().describe('The number of tokens to keep for top-k filtering.'),
  stream: z.boolean().default(false).optional().describe('Determines whether to stream the response incrementally.'),
  presence_penalty: z.number().default(0).optional().describe('Positive values increase the likelihood of discussing new topics.'),
  frequency_penalty: z.number().default(0).optional().describe('Decreases likelihood of repetition based on prior frequency.'),
  web_search_options: z
    .object({
      search_context_size: z.enum(['low', 'medium', 'high']).optional(),
    })
    .optional(),
});

export const perplexityBridgeChatCompletionsRawOutputSchema = z.object({
  id: z.string(),
  model: z.nativeEnum(PerplexityModel),
  created: z.number(),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
    search_context_size: z.string().nullable().optional(),
    citation_tokens: z.number().nullable().optional(),
    num_search_queries: z.number().nullable().optional(),
    reasoning_tokens: z.number().nullable().optional(),
  }),
  object: z.string().default('chat.completion'),
  choices: z.array(
    z.object({
      index: z.number(),
      finish_reason: z.string(),
      message: z.object({
        content: z.string(),
        role: z.enum(['system', 'user', 'assistant']),
      }),
    }),
  ),
  citations: z.array(z.string()).nullable(),
  search_results: z
    .array(
      z.object({
        title: z.string(),
        url: z.string(),
        date: z.string().nullable().optional(),
      }),
    )
    .nullable(),
});

export const perplexityBridgeChatCompletionsInputSchema = perplexityBridgeChatCompletionsRawInputSchema;

export const perplexityBridgeChatCompletionsOutputSchema = z.object({
  answer: z.string(),
  sources: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      date: z.string(),
    }),
  ),
  confidence: z.string(),
});

export type PerplexityBridgeChatCompletionsRawInput = z.infer<typeof perplexityBridgeChatCompletionsRawInputSchema>;
export type PerplexityBridgeChatCompletionsRawOutput = z.infer<typeof perplexityBridgeChatCompletionsRawOutputSchema>;
export type PerplexityBridgeChatCompletionsInput = z.infer<typeof perplexityBridgeChatCompletionsInputSchema>;
export type PerplexityBridgeChatCompletionsOutput = z.infer<typeof perplexityBridgeChatCompletionsOutputSchema>;
