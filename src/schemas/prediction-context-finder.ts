import { z } from 'zod';

export const PredictionContextFinderFindContextInputSchema = z.object({
  entityId: z.string(),
  platform: z.union([z.literal('x'), z.literal('twitter')]).default('x'),
  includeRaw: z.boolean().default(true),
});
export type PredictionContextFinderFindContextInput = z.infer<typeof PredictionContextFinderFindContextInputSchema>;

export const PredictionContextFinderFindContextOutputSchema = z.object({
  entityId: z.string(),
  platform: z.union([z.literal('x'), z.literal('twitter')]),
  context: z.string(),
  rawContext: z.any().optional(),
});
export type PredictionContextFinderFindContextOutput = z.infer<typeof PredictionContextFinderFindContextOutputSchema>;

export const PredictionContextFinderFindPredictionContextInputSchema = z.object({
  predictionId: z.number(),
  includeRaw: z.boolean().default(true).optional(),
});
export type PredictionContextFinderFindPredictionContextInput = z.infer<typeof PredictionContextFinderFindPredictionContextInputSchema>;

export const PredictionContextFinderFindPredictionContextOutputSchema = z.object({
  predictionId: z.number(),
  entityId: z.string(),
  platform: z.enum(['x', 'twitter']),
  context: z.string(),
  rawContext: z.any().optional(),
});
export type PredictionContextFinderFindPredictionContextOutput = z.infer<typeof PredictionContextFinderFindPredictionContextOutputSchema>;

export const PredictionContextFinderScheduledInputSchema = z.object({}).describe('Input for the scheduled prediction context finder job.');

export const PredictionContextFinderScheduledOutputSchema = z.object({
  status: z.string(),
  updatedPredictions: z.array(z.number()),
});
