import { z } from 'zod';

import { PredictionOutcome, predictionOutcomeSchema } from './torus-swarm-memory';

export const predictionVerifierVerifySwarmPredictionInputSchema = z.object({
  predictionId: z.number().describe('The swarm memory prediction id to fetch, verify, and create a prediction claim for'),
});

export const predictionVerifierVerifyRawPredictionInputSchema = z.object({
  prediction: z.string().describe('the prediction text to verify'),
  context: z.record(z.string(), z.any()).optional(),
});

const verificationResultSchema = z.object({
  outcome: predictionOutcomeSchema.describe('The outcome of the prediction verification process'),
  proof: z
    .string()
    .describe(
      'The proof for the verification claim (markdown text containing data, links to sources, reasoning). If outcome is MostlyTrue or Unverifiable, the proof should contain details about which parts of the prediction are true/false/unverifiable.',
    ),
});

export const predictionVerifierVerifyRawPredictionOutputSchema = verificationResultSchema.extend({
  prediction: z.string().describe('The prediction text that was processed'),
});

export const predictionVerifierScheduledInputSchema = z.object({});

export const predictionVerifierVerifySwarmPredictionOutputSchema = verificationResultSchema.extend({
  prediction_id: z.number().int().describe('The ID of the prediction that this verification claim is for'),
  full_post: z.string().optional().describe('The full post text from swarm memory'),
});

export const predictionVerifierScheduledOutputSchema = z.array(predictionVerifierVerifySwarmPredictionOutputSchema);

export type PredictionVerifierVerifySwarmPredictionInput = z.infer<typeof predictionVerifierVerifySwarmPredictionInputSchema>;
export type PredictionVerifierVerifyRawPredictionInput = z.infer<typeof predictionVerifierVerifyRawPredictionInputSchema>;
export type PredictionVerifierVerifySwarmPredictionOutput = z.infer<typeof predictionVerifierVerifySwarmPredictionOutputSchema>;
export type PredictionVerifierVerifyRawPredictionOutput = z.infer<typeof predictionVerifierVerifyRawPredictionOutputSchema>;
export type PredictionVerifierScheduledInput = z.infer<typeof predictionVerifierScheduledInputSchema>;
export type PredictionVerifierScheduledOutput = z.infer<typeof predictionVerifierScheduledOutputSchema>;
export type VerificationResult = z.infer<typeof verificationResultSchema>;
export { PredictionOutcome };
