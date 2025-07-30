import { z } from 'zod';

export const PredictionContextFinderRequestSchema = z.object({
  entityId: z.string(),
  platform: z.union([z.literal('x'), z.literal('twitter')]),
  includeRaw: z.boolean().default(true),
});
export type PredictionContextFinderRequest = z.infer<typeof PredictionContextFinderRequestSchema>;

export const PredictionContextFinderResponseSchema = z.object({
  entityId: z.string(),
  platform: z.union([z.literal('x'), z.literal('twitter')]),
  context: z.string(),
  rawContext: z.any().optional(),
});
export type PredictionContextFinderResponse = z.infer<typeof PredictionContextFinderResponseSchema>;

export const FindPredictionContextRequestSchema = z.object({
  predictionId: z.number(),
});
export type FindPredictionContextRequest = z.infer<typeof FindPredictionContextRequestSchema>;

export const FindPredictionContextResponseSchema = z.object({
  entityId: z.string(),
  platform: z.enum(['x', 'twitter']),
  context: z.string(),
  rawContext: z.any().optional(),
});

export const predictionContextFinderScheduledInputSchema = z.object({}).describe('Input for the scheduled prediction context finder job.');

export const predictionContextFinderScheduledOutputSchema = z.object({
  status: z.string(),
  updatedPredictions: z.array(z.number()),
});
