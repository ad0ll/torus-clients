// This is a reference Torus SDK client for the english classification service
import { AgentClient, Keypair } from '@torus-network/sdk/agent-client';

import { ENGLISH_CLASSIFIER_BASE_URL } from './common';
import {
  type EnglishClassifierIsEnglishBatchRequest,
  type EnglishClassifierIsEnglishBatchResponse,
  type EnglishClassifierIsEnglishRequest,
  type EnglishClassifierIsEnglishResponse,
} from './schemas';

export class EnglishClassifierClient {
  private client: AgentClient;

  // Pass your own mnemonic here to use the prediction detector agent as your own agent
  constructor(mnemonic: string, baseUrl: string = ENGLISH_CLASSIFIER_BASE_URL) {
    const keypair = new Keypair(mnemonic);
    this.client = new AgentClient({ keypair, baseUrl });
  }

  async text(input: EnglishClassifierIsEnglishRequest) {
    const response = await this.client.call({
      method: 'POST',
      endpoint: 'text',
      data: input,
    });

    if (response.success) {
      return {
        success: true,
        data: response.data as EnglishClassifierIsEnglishResponse,
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to classify text',
      };
    }
  }

  async textBatch(input: EnglishClassifierIsEnglishBatchRequest) {
    const response = await this.client.call({
      method: 'POST',
      endpoint: 'text.batch',
      data: input,
    });

    if (response.success) {
      return {
        success: true,
        results: response.data as EnglishClassifierIsEnglishBatchResponse,
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to batch classify texts',
      };
    }
  }
}
