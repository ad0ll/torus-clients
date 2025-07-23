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
