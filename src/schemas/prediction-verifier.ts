import { z } from 'zod';

import { PredictionOutcome, predictionOutcomeSchema } from './torus-swarm-memory';

export const llmProviderSchema = z.enum(['openrouter', 'venice']);
export type LlmProvider = z.infer<typeof llmProviderSchema>;

export const predictionVerifierVerifySwarmPredictionInputSchema = z.object({
  predictionId: z.number().describe('The swarm memory prediction id to fetch, verify, and create a prediction claim for'),
  llmProvider: llmProviderSchema.default('venice'),
});

export const predictionVerifierVerifyRawPredictionInputSchema = z.object({
  prediction: z.string().describe('the prediction text to verify'),
  context: z.record(z.string(), z.any()).optional(),
  llmProvider: llmProviderSchema.default('venice'),
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
  llmProvider: llmProviderSchema,
});

export const predictionVerifierScheduledInputSchema = z.object({
  llmProvider: llmProviderSchema.default('venice'),
});

export const predictionVerifierVerifySwarmPredictionOutputSchema = verificationResultSchema.extend({
  prediction_id: z.number().int().describe('The ID of the prediction that this verification claim is for'),
  full_post: z.string().optional().describe('The full post text from swarm memory'),
  llmProvider: llmProviderSchema,
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
