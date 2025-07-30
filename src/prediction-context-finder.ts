import { AgentClient, Keypair } from '@torus-network/sdk/agent-client';
import { z } from 'zod';

import { PREDICTION_CONTEXT_FINDER_BASE_URL } from './common';
import {
  type FindPredictionContextRequest,
  FindPredictionContextResponseSchema,
  type PredictionContextFinderRequest,
  type PredictionContextFinderResponse,
  predictionContextFinderScheduledOutputSchema,
} from './schemas';

export class PredictionContextFinderClient {
  private client: AgentClient;

  constructor(mnemonic: string, baseUrl: string = PREDICTION_CONTEXT_FINDER_BASE_URL) {
    const keypair = new Keypair(mnemonic);
    this.client = new AgentClient({ keypair, baseUrl });
  }

  async findContext(input: PredictionContextFinderRequest): Promise<{
    success: boolean;
    data?: PredictionContextFinderResponse;
    error?: string;
  }> {
    const response = await this.client.call({
      endpoint: 'find-context',
      data: input,
    });

    if (response.success) {
      return {
        success: true,
        data: response.data as PredictionContextFinderResponse,
      };
    }
    return {
      success: false,
      error: response.error?.message || 'Failed to find context',
    };
  }

  async findPredictionContext(input: FindPredictionContextRequest): Promise<{
    success: boolean;
    data?: z.infer<typeof FindPredictionContextResponseSchema>;
    error?: string;
  }> {
    const response = await this.client.call({
      endpoint: 'find-prediction-context',
      data: input,
    });

    if (response.success) {
      return {
        success: true,
        data: response.data as z.infer<typeof FindPredictionContextResponseSchema>,
      };
    }
    return {
      success: false,
      error: response.error?.message || 'Failed to find prediction context',
    };
  }

  async scheduled(): Promise<{
    success: boolean;
    data?: z.infer<typeof predictionContextFinderScheduledOutputSchema>;
    error?: string;
  }> {
    const response = await this.client.call({
      endpoint: 'scheduled',
      data: {},
    });

    if (response.success) {
      return {
        success: true,
        data: response.data as z.infer<typeof predictionContextFinderScheduledOutputSchema>,
      };
    }
    return {
      success: false,
      error: response.error?.message || 'Failed to call scheduled endpoint',
    };
  }
}
