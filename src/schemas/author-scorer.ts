import z from 'zod';

export const authorScorerScoreAuthorInputSchema = z.object({
  entityId: z.string().optional().describe('The user ID of the entity.'),
  entityUsername: z.string().optional().describe('The username of the entity.'),
  platform: z.enum(['x', 'twitter']).default('x'),
  model: z.string().optional().default('qwen/qwen3-30b-a3b-instruct-2507').describe('The OpenRouter model name to use, e.g., "qwen/qwen3-30b-a3b-instruct-2507".'),
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
    model: z.string().optional().default('qwen/qwen3-30b-a3b-instruct-2507').describe('The OpenRouter model name to use, e.g., "qwen/qwen3-30b-a3b-instruct-2507".'),
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
