import { z } from 'zod';

// Schemas for is-english method
export const EnglishClassifierIsEnglishInputSchema = z.object({
  text: z.string().describe('The text to be analyzed.'),
  defaultOnUndetermined: z
    .boolean()
    .default(false)
    .describe("When true, if the outcome of language detection is 'uncertain', it will return 'yes'."),
});

export const EnglishClassifierIsEnglishOutputSchema = z.object({
  isEnglish: z.boolean().describe('Whether the text is English.'),
});

// Schemas for is-english.batch method
export const EnglishClassifierIsEnglishBatchInputSchema = z.object({
  texts: z.array(z.object({ text: z.string() })),
  defaultOnUndetermined: z
    .boolean()
    .default(false)
    .describe("When true, if the outcome of language detection is 'uncertain', it will return 'yes'."),
});

export const EnglishClassifierIsEnglishBatchOutputSchema = z.array(
  z.object({
    text: z.string().describe('The original text that was analyzed.'),
    isEnglish: z.boolean().describe('Whether the text is English.'),
  }),
);

export type EnglishClassifierIsEnglishRequest = z.infer<typeof EnglishClassifierIsEnglishInputSchema>;
export type EnglishClassifierIsEnglishResponse = z.infer<typeof EnglishClassifierIsEnglishOutputSchema>;
export type EnglishClassifierIsEnglishBatchRequest = z.infer<typeof EnglishClassifierIsEnglishBatchInputSchema>;
export type EnglishClassifierIsEnglishBatchResponse = z.infer<typeof EnglishClassifierIsEnglishBatchOutputSchema>;
