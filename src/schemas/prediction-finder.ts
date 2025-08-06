import z from 'zod';

export const predictionFinderOnDemandInputSchema = z.object({
  query: z.string().describe('The search query for finding predictions.'),
  platform: z.enum(['x', 'twitter']).describe('The platform to search on. Currently only "x" and "twitter" are supported.'),
});

export const predictionFinderScheduledInputSchema = z.object({}).describe('Input for the scheduled prediction finder. Takes no arguments.');

export type PredictionFinderOnDemandInputSchema = z.infer<typeof predictionFinderOnDemandInputSchema>;

export type PredictionFinderScheduledInputSchema = z.infer<typeof predictionFinderScheduledInputSchema>;

const baseOutputSchema = z.object({
  processedTweets: z.number().int().gte(0),
  insertedPredictions: z.number().int().gte(0),
  rejectionCounts: z.object({
    nonEnglish: z.number().int().gte(0),
    notPrediction: z.number().int().gte(0),
    notVerifiable: z.number().int().gte(0),
    notHighConfidencePrediction: z.number().int().gte(0),
    processingErrors: z.number().int().gte(0),
  }),
  cacheHits: z.number().int().gte(0),
});

export const predictionFinderOnDemandOutputSchema = baseOutputSchema.extend({
  query: z.string(),
  status: z.string(),
});

const scheduledQueryOutputSchema = baseOutputSchema.extend({
  query: z.string(),
});

export const predictionFinderScheduledOutputSchema = z.object({
  status: z.string(),
  queries: z.array(scheduledQueryOutputSchema),
  total: baseOutputSchema,
});

export type PredictionFinderOnDemandOutputSchema = z.infer<typeof predictionFinderOnDemandOutputSchema>;

export type PredictionFinderScheduledOutputSchema = z.infer<typeof predictionFinderScheduledOutputSchema>;
