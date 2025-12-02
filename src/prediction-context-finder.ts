import { AgentClient, Keypair } from '@torus-network/sdk/agent-client';
import { z } from 'zod';

import { agentPublicConfigs } from './common';
import {
  type PredictionContextFinderFindContextInput,
  type PredictionContextFinderFindContextOutput,
  type PredictionContextFinderFindPredictionContextInput,
  type PredictionContextFinderFindPredictionContextOutput,
  PredictionContextFinderScheduledOutputSchema,
} from './schemas';

export class PredictionContextFinderClient {
  private client: AgentClient;

  constructor(mnemonic: string, baseUrl: string = agentPublicConfigs['prediction-context-finder'].url) {
    const keypair = new Keypair(mnemonic);
    this.client = new AgentClient({ keypair, baseUrl });
    console.log('PredictionContextFinderClient initialized at', baseUrl);
  }

  async findContext(input: PredictionContextFinderFindContextInput): Promise<{
    success: boolean;
    data?: PredictionContextFinderFindContextOutput;
    error?: string;
  }> {
    const response = await this.client.call({
      endpoint: 'find-context',
      data: input,
    });

    if (response.success) {
      return {
        success: true,
        data: response.data as PredictionContextFinderFindContextOutput,
      };
    }
    return {
      success: false,
      error: response.error?.message || 'Failed to find context',
    };
  }

  async findPredictionContext(params: PredictionContextFinderFindPredictionContextInput): Promise<{
    success: boolean;
    data?: PredictionContextFinderFindPredictionContextOutput;
    error?: string;
  }> {
    const response = await this.client.call({
      endpoint: 'find-prediction-context',
      data: params,
    });

    if (response.success) {
      return {
        success: true,
        data: response.data as PredictionContextFinderFindPredictionContextOutput,
      };
    }
    return {
      success: false,
      error: response.error?.message || 'Failed to find prediction context',
    };
  }

  async scheduled(): Promise<{
    success: boolean;
    data?: z.infer<typeof PredictionContextFinderScheduledOutputSchema>;
    error?: string;
  }> {
    const response = await this.client.call({
      endpoint: 'scheduled',
      data: {},
    });

    if (response.success) {
      return {
        success: true,
        data: response.data as z.infer<typeof PredictionContextFinderScheduledOutputSchema>,
      };
    }
    return {
      success: false,
      error: response.error?.message || 'Failed to call scheduled endpoint',
    };
  }
}
