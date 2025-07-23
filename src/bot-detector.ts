// This is a reference Torus SDK client for the bot detection/author scoring service
import { AgentClient, Keypair } from '@torus-network/sdk/agent-client';

import { BOT_DETECTOR_BASE_URL } from './common';
import {
  AuthorScorerScoreAuthorBatchInputSchema,
  AuthorScorerScoreAuthorBatchOutputSchema,
  AuthorScorerScoreAuthorInputSchema,
  AuthorScorerScoreAuthorOutputSchema,
} from './schemas';

export class BotDetectorClient {
  private client: AgentClient;

  // Pass your own mnemonic here to use the bot detector agent as your own agent
  constructor(mnemonic: string, baseUrl: string = BOT_DETECTOR_BASE_URL) {
    const keypair = new Keypair(mnemonic);
    this.client = new AgentClient({ keypair, baseUrl });
  }

  async scoreAuthor(input: AuthorScorerScoreAuthorInputSchema) {
    console.log('Score author', input);
    const response = await this.client.call({
      endpoint: 'score-author',
      data: input,
    });

    if (response.success) {
      console.log('Score author success', response.data);
      return {
        success: true,
        data: response.data as AuthorScorerScoreAuthorOutputSchema,
      };
    } else {
      console.log('Score author error', response.error);
      const errorMessage = (response.error as any)?.error || response.error?.message || 'Failed to score author';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async scoreAuthorBatch(input: AuthorScorerScoreAuthorBatchInputSchema) {
    console.log('Scoring author batch', input);
    const response = await this.client.call({
      endpoint: 'score-author-batch',
      data: input,
    });

    if (response.success) {
      console.log('Scoring author batch success', response.data);
      return {
        success: true,
        results: response.data as AuthorScorerScoreAuthorBatchOutputSchema,
      };
    } else {
      console.log('Scoring author batch error', response.error);
      const errorMessage = (response.error as any)?.error || response.error?.message || 'Failed to batch score authors';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
