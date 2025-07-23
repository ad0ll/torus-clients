import { z } from 'zod';

export const verdictReasoningAgentCreatePredictionVerdictInputSchema = z.object({
  predictionId: z.number().int().positive(),
});

export const verdictReasoningAgentCreatePredictionVerdictOutputSchema = z
  .object({
    id: z.number().int().positive(),
    inserted_at: z.string(),
    inserted_by_address: z.string(),
    prediction_id: z.number().int().positive(),
    prediction_verification_claim_id: z.number().int().positive(),
    reasoning: z.string(),
    verdict: z.boolean(),
  })
  .nullable();

export const verdictReasoningAgentCreatePredictionVerdictErrorSchema = z.object({
  prediction_id: z.number().int().positive(),
  error: z.string(),
});

export const verdictReasoningAgentScheduledInputSchema = z.object({});

export const verdictReasoningAgentScheduledOutputSchema = z.array(
  z.union([verdictReasoningAgentCreatePredictionVerdictOutputSchema, verdictReasoningAgentCreatePredictionVerdictErrorSchema]),
);

export type VerdictReasoningAgentCreatePredictionVerdictInput = z.infer<typeof verdictReasoningAgentCreatePredictionVerdictInputSchema>;
export type VerdictReasoningAgentCreatePredictionVerdictOutput = z.infer<typeof verdictReasoningAgentCreatePredictionVerdictOutputSchema>;
export type VerdictReasoningAgentCreatePredictionVerdictError = z.infer<typeof verdictReasoningAgentCreatePredictionVerdictErrorSchema>;
export type VerdictReasoningAgentScheduledInput = z.infer<typeof verdictReasoningAgentScheduledInputSchema>;
export type VerdictReasoningAgentScheduledOutput = z.infer<typeof verdictReasoningAgentScheduledOutputSchema>;
