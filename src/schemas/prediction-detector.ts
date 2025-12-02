import z from 'zod';

export const predictionDetectorTextInputSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty').describe('The text to check for predictionness'),
  model: z
    .string()
    .optional()
    .default('qwen/qwen3-30b-a3b-instruct-2507')
    .describe('The OpenRouter model name to use, e.g., "qwen/qwen3-30b-a3b-instruct-2507".'),
  models: z.array(z.string()).optional().describe('An array of OpenRouter model names to use as fallbacks.'),
  provider: z
    .enum(['openrouter', 'venice'])
    .optional()
    .default('openrouter')
    .describe('The LLM provider to use, e.g., "openrouter" or "venice". When set to "venice", model + modelsis ignored.'),
});

export const predictionDetectorTextBatchInputSchema = z.object({
  texts: z.array(z.string().min(1)).min(1, 'Texts array cannot be empty').describe('An array of texts to check for predictionness'),
  model: z
    .string()
    .optional()
    .default('qwen/qwen3-30b-a3b-instruct-2507')
    .describe('The OpenRouter model name to use, e.g., "qwen/qwen3-30b-a3b-instruct-2507".'),
  models: z.array(z.string()).optional().describe('An array of OpenRouter model names to use as fallbacks.'),
  provider: z.enum(['openrouter', 'venice']).optional().default('openrouter'),
});

export const predictionDetectorXInputSchema = z.object({
  postIds: z.string().min(1, 'postIds cannot be empty').describe('A comma-separated list of tweet IDs to classify.'),
  model: z
    .string()
    .optional()
    .default('qwen/qwen3-30b-a3b-instruct-2507')
    .describe('The OpenRouter model name to use, e.g., "qwen/qwen3-30b-a3b-instruct-2507".'),
  models: z.array(z.string()).optional().describe('An array of OpenRouter model names to use as fallbacks.'),
  provider: z.enum(['openrouter', 'venice']).optional().default('openrouter'),
});
// This is entrypoint neutral, all functions return this or an array of this.
export const predictionDetectorSingleItemOutputSchema = z.object({
  contains_prediction: z.boolean().describe('Whether the text contains a prediction about the future'),
  confidence: z.number().int().min(1).max(10).optional().nullable().describe('When contains_prediction is true, confidence level from 1-10 (no decimals)'),
  reasoning: z.string().describe('A concise explanation for the classification, no more than 200 words.'),
  topic: z.string().describe('The topic of the prediction, e.g., "politics", "sports", "crypto".'),
  full_post: z.string(),
  predictions: z.array(z.string()).describe('An array of verbatim, character-for-character text excerpts from the original text that contain a prediction.'),
  error: z.string().optional(),
});

// Put here since people intuitively would expect it given convention of other exported schemas
export const predictionDetectorTextOutputSchema = predictionDetectorSingleItemOutputSchema;

export const predictionDetectorTextBatchOutputSchema = z.array(predictionDetectorSingleItemOutputSchema);

export const predictionDetectorXOutputSchema = z.array(
  predictionDetectorSingleItemOutputSchema.extend({
    postId: z.string(),
  }),
);

export type PredictionDetectorSingleItemOutputSchema = z.infer<typeof predictionDetectorSingleItemOutputSchema>;

export type PredictionDetectorTextInputSchema = z.infer<typeof predictionDetectorTextInputSchema>;

export type PredictionDetectorTextBatchInputSchema = z.infer<typeof predictionDetectorTextBatchInputSchema>;

export type PredictionDetectorXInputSchema = z.infer<typeof predictionDetectorXInputSchema>;

export type PredictionDetectorTextOutputSchema = z.infer<typeof predictionDetectorTextOutputSchema>;
export type PredictionDetectorTextBatchOutputSchema = z.infer<typeof predictionDetectorTextBatchOutputSchema>;
export type PredictionDetectorXOutputSchema = z.infer<typeof predictionDetectorXOutputSchema>;
//TODO Clean me up, only used in one place
export type PredictionDetectorXOutputSchemaSingle = z.infer<typeof predictionDetectorXOutputSchema>[number];
