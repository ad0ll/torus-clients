import { AgentClient, Keypair } from '@torus-network/sdk/agent-client';

import { PREDICTION_CONTEXT_FINDER_BASE_URL } from './common';
import {
  type FindPredictionContextRequest,
  type FindPredictionContextResponse,
  type PredictionContextFinderRequest,
  type PredictionContextFinderResponse,
} from './schemas';

export class PredictionContextFinderClient {
  private client: AgentClient;

  constructor(mnemonic: string, baseUrl: string = PREDICTION_CONTEXT_FINDER_BASE_URL) {
    const keypair = new Keypair(mnemonic);
    console.log(`PredictionContextFinderClient sending requests to: ${baseUrl}`);
    this.client = new AgentClient({
      keypair,
      baseUrl,
    });
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
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to find context',
      };
    }
  }

  async findPredictionContext(input: FindPredictionContextRequest): Promise<{
    success: boolean;
    data?: FindPredictionContextResponse;
    error?: string;
  }> {
    const response = await this.client.call({
      endpoint: 'find-prediction-context',
      data: input,
    });

    if (response.success) {
      return {
        success: true,
        data: response.data as FindPredictionContextResponse,
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to find prediction context',
      };
    }
  }
}
