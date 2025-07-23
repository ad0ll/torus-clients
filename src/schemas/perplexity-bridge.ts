import { z } from 'zod';

const messageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string(),
});

export const perplexityBridgeChatCompletionsRawInputSchema = z.object({
  model: z.string().describe('The name of the model that will complete your prompt.'),
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
  response_format: z.object({}).passthrough().optional().describe('Enables structured JSON output formatting.'),
  web_search_options: z
    .object({
      user_location: z
        .object({
          latitude: z.number(),
          longitude: z.number(),
          country: z.string(),
        })
        .optional(),
    })
    .optional()
    .describe('Configuration for using web search in model responses.'),
});

export const perplexityBridgeChatCompletionsRawOutputSchema = z.object({
  id: z.string(),
  model: z.enum([
    'sonar', // $1/m input, $1/m output A lightweight, cost-effective search model optimized for quick, grounded answers with real-time web search.
    'sonar-pro', //$3/m input, $15/m output An advanced search model designed for complex queries, delivering deeper content understanding with enhanced citation accuracy and 2x more citations than standard Sonar.
    'sonar-reasoning', // $1/m input, $5/m output A reasoning-focused model that applies Chain-of-Thought (CoT) reasoning for quick problem-solving and structured analysis with real-time web search.
    'sonar-reasoning-pro', // $2/m input, $8/m output A high-performance reasoning model leveraging advanced multi-step Chain-of-Thought (CoT) reasoning and enhanced information retrieval for complex problem-solving.
    'sonar-deep-research', // $2/m input, $8/m output A powerful research model capable of conducting exhaustive searches across hundreds of sources, synthesizing expert-level insights, and generating detailed reports with comprehensive analysis.
  ]),
  created: z.number(),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
    search_context_size: z.string().nullable(),
    citation_tokens: z.number().nullable(),
    num_search_queries: z.number().nullable(),
    reasoning_tokens: z.number().nullable(),
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
        date: z.string(),
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
