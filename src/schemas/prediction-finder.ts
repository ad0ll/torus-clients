import z from 'zod';

import { swarmTweetSchema } from './torus-swarm-memory';

export const predictionFinderOnDemandInputSchema = z.object({
  query: z.string().describe('The search query for finding predictions.'),
  platform: z.enum(['x', 'twitter']).describe('The platform to search on. Currently only "x" and "twitter" are supported.'),
});

export const predictionFinderScheduledInputSchema = z.object({}).describe('Input for the scheduled prediction finder. Takes no arguments.');

export type PredictionFinderOnDemandInputSchema = z.infer<typeof predictionFinderOnDemandInputSchema>;

export type PredictionFinderScheduledInputSchema = z.infer<typeof predictionFinderScheduledInputSchema>;

export const rejectionReasonSchema = z.enum([
  'nonEnglish',
  'doesntContainPrediction',
  'lowConfidenceOnContainsPrediction',
  'allPredictionsNotVerifiable',
  'allPredictionsDuplicatePrediction',
  'allPredictionsInvalid',
  'processedWithoutNewPredictions',
]);
export type RejectionReason = z.infer<typeof rejectionReasonSchema>;

const baseOutputSchema = z.object({
  processedTweets: z.number().int().gte(0),
  tweetsWithValidPredictions: z.number().int().gte(0),
  insertedPredictions: z.number().int().gte(0),
  rejectionCounts: z.record(rejectionReasonSchema, z.number().int().gte(0)),
  processingErrors: z.number().int().gte(0),
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

export const predictionFinderScheduledProphetFinderInputSchema = z
  .object({})
  .describe('Input for the scheduled prophet finder. Takes no arguments.');

export const predictionFinderScheduledProphetFinderOutputSchema = baseOutputSchema.extend({
  status: z.string(),
});

export type PredictionFinderScheduledProphetFinderInputSchema = z.infer<typeof predictionFinderScheduledProphetFinderInputSchema>;

export type PredictionFinderScheduledProphetFinderOutputSchema = z.infer<typeof predictionFinderScheduledProphetFinderOutputSchema>;

export const tweetFinalStatusSchema = z.enum([
  'processed_with_predictions', // At least one prediction was inserted
  'processed_without_predictions', // Processed fully, but no predictions were inserted (all duplicates, unverifiable, etc.)
  'rejected_nonEnglish',
  'rejected_notPrediction',
  'rejected_notHighConfidencePrediction',
  'error', // A processing error occurred for this tweet
]);
export type TweetFinalStatus = z.infer<typeof tweetFinalStatusSchema>;

export const tweetResultSchema = z.object({
  tweetId: z.string(),
  fullPost: z.string(),
  insertedPredictionsCount: z.number(),
  rejectionReason: rejectionReasonSchema.nullable(),
  processingError: z.boolean(),
  cacheHits: z.number(),
});

export type TweetResultSchema = z.infer<typeof tweetResultSchema>;

export const predictionFinderProcessSwarmTweetsInputSchema = z.object({
  swarmTweets: z.array(swarmTweetSchema).describe('Array of SwarmTweets to process for predictions.'),
  queryName: z
    .string()
    .optional()
    .default('prophet-finder')
    .describe('Optional query name for processing metrics (default: prophet-finder).'),
});

export const predictionFinderProcessSwarmTweetsOutputSchema = baseOutputSchema.extend({
  queryName: z.string(),
  status: z.string(),
  tweetResults: z.array(tweetResultSchema),
});

export type PredictionFinderProcessSwarmTweetsInputSchema = z.infer<typeof predictionFinderProcessSwarmTweetsInputSchema>;

export type PredictionFinderProcessSwarmTweetsOutputSchema = z.infer<typeof predictionFinderProcessSwarmTweetsOutputSchema>;
