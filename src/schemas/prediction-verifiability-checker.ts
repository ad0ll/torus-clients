import { z } from 'zod';

export const CheckPredictionVerifiabilityInputSchema = z.object({
  prediction: z.string(),
  context: z.any().optional(),
  includeRawContext: z.boolean().optional().default(false),
});

export const CheckPredictionVerifiabilityOutputSchema = z.object({
  isVerifiable: z.boolean(),
  reasoning: z.string(),
  prediction: z.string(),
  rawContext: z.any().optional(),
});

export type CheckPredictionVerifiabilityInput = z.infer<typeof CheckPredictionVerifiabilityInputSchema>;
export type CheckPredictionVerifiabilityOutput = z.infer<typeof CheckPredictionVerifiabilityOutputSchema>;

export const CheckVerifiabilitySwarmInputSchema = z.object({
  prediction_id: z.number(),
  includeRawContext: z.boolean().optional().default(false),
});

export const CheckVerifiabilitySwarmOutputSchema = CheckPredictionVerifiabilityOutputSchema.extend({
  predictionId: z.number(),
});

export type CheckVerifiabilitySwarmInput = z.infer<typeof CheckVerifiabilitySwarmInputSchema>;
export type CheckVerifiabilitySwarmOutput = z.infer<typeof CheckVerifiabilitySwarmOutputSchema>;
