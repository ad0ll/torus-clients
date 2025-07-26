import { z } from 'zod';

export const proxyRequestScrapeInputSchema = z.object({
  url: z.string(),
});
export type ProxyRequestScrapeInput = z.infer<typeof proxyRequestScrapeInputSchema>;

export const proxyRequestScrapeOutputSchema = z.string();
export type ProxyRequestScrapeOutput = z.infer<typeof proxyRequestScrapeOutputSchema>;

export const proxyRequestFetchInputSchema = z.object({
  url: z.string(),
  method: z.string().optional(),
  baseURL: z.string().optional(),
  headers: z.any().optional(),
  params: z.any().optional(),
  data: z.any().optional(),
  timeout: z.number().optional(),
  responseType: z
    .union([z.literal('arraybuffer'), z.literal('document'), z.literal('json'), z.literal('text'), z.literal('stream'), z.literal('blob')])
    .optional(),
});
export type ProxyRequestFetchInput = z.infer<typeof proxyRequestFetchInputSchema>;

export const proxyRequestFetchOutputSchema = z.object({
  data: z.any(),
  status: z.number(),
  statusText: z.string(),
  headers: z.any(),
});
export type ProxyRequestFetchOutput = z.infer<typeof proxyRequestFetchOutputSchema>;
