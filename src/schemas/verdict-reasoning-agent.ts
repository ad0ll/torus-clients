import { z } from 'zod';

import { predictionOutcomeSchema } from './torus-swarm-memory';

export const verdictReasoningAgentCreatePredictionVerdictInputSchema = z.object({
  predictionId: z.number().int().positive(),
  llmProvider: z.enum(['openrouter', 'perplexity', 'venice']).optional().default('venice'),
});

export const verdictReasoningAgentCreatePredictionVerdictOutputSchema = z
  .object({
    id: z.number().int().positive(),
    inserted_at: z.string(),
    inserted_by_address: z.string(),
    prediction_id: z.number().int().positive(),
    prediction_verification_claim_id: z.number().int().positive().nullable(),
    reasoning: z.string(),
    outcome: predictionOutcomeSchema,
    llmProvider: z.enum(['openrouter', 'perplexity', 'venice']).optional(),
  })
  .nullable();

export const verdictReasoningAgentCreatePredictionVerdictErrorSchema = z.object({
  prediction_id: z.number().int().positive(),
  error: z.string(),
});

export const verdictReasoningAgentScheduledInputSchema = z.object({
  llmProvider: z.enum(['openrouter', 'perplexity', 'venice']).optional().default('venice'),
});

export const verdictReasoningAgentScheduledOutputSchema = z.array(
  z.union([verdictReasoningAgentCreatePredictionVerdictOutputSchema, verdictReasoningAgentCreatePredictionVerdictErrorSchema]),
);

export type VerdictReasoningAgentCreatePredictionVerdictInput = z.infer<typeof verdictReasoningAgentCreatePredictionVerdictInputSchema>;
export type VerdictReasoningAgentCreatePredictionVerdictOutput = z.infer<typeof verdictReasoningAgentCreatePredictionVerdictOutputSchema>;
export type VerdictReasoningAgentCreatePredictionVerdictError = z.infer<typeof verdictReasoningAgentCreatePredictionVerdictErrorSchema>;
export type VerdictReasoningAgentScheduledInput = z.infer<typeof verdictReasoningAgentScheduledInputSchema>;
export type VerdictReasoningAgentScheduledOutput = z.infer<typeof verdictReasoningAgentScheduledOutputSchema>;
