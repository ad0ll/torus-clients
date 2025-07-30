import z from 'zod';

export const predictionDetectorTextInputSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty').describe('The text to check for predictionness'),
  model: z.string().optional().default('openai/gpt-4.1-mini').describe('The OpenRouter model name to use, e.g., "openai/gpt-4.1-mini".'),
});

export const predictionDetectorTextBatchInputSchema = z.object({
  texts: z.array(z.string().min(1)).min(1, 'Texts array cannot be empty').describe('An array of texts to check for predictionness'),
  model: z.string().optional().default('openai/gpt-4.1-mini').describe('The OpenRouter model name to use, e.g., "openai/gpt-4.1-mini".'),
});

export const predictionDetectorXInputSchema = z.object({
  postIds: z.string().min(1, 'postIds cannot be empty').describe('A comma-separated list of tweet IDs to classify.'),
  model: z.string().optional().default('openai/gpt-4.1-mini').describe('The OpenRouter model name to use, e.g., "openai/gpt-4.1-mini".'),
});
// This is entrypoint neutral, all functions return this or an array of this.
export const predictionDetectorSingleItemOutputSchema = z.object({
  prediction: z.boolean().describe('Whether the text contains a prediction about the future'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('The confidence of the prediction on a scale of 0 to 1, where 1 is very confident and 0 is not confident at all.'),
  reasoning: z.string().describe('A concise explanation for the classification, no more than 150 words.'),
  topic: z.string().describe('The topic of the prediction, e.g., "politics", "sports", "crypto".'),
  full_post: z.string(),
  predictions: z.array(z.string()),
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
