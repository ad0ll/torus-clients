import { AgentClient, Keypair } from '@torus-network/sdk/agent-client';

import { agentPublicConfigs } from './common';
import { type PredictionFinderOnDemandInputSchema, type PredictionFinderScheduledInputSchema } from './schemas';

export class PredictionFinderClient {
  private client: AgentClient;

  // Pass your own mnemonic here to use the prediction finder agent as your own agent
  constructor(mnemonic: string, baseUrl: string = agentPublicConfigs['prediction-finder'].url) {
    const keypair = new Keypair(mnemonic);
    this.client = new AgentClient({ keypair, baseUrl });
  }

  async findPredictionsOnDemand(input: PredictionFinderOnDemandInputSchema) {
    const response = await this.client.call({
      endpoint: 'on-demand',
      data: input,
    });

    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to call on-demand endpoint',
      };
    }
  }

  async findPredictionsScheduled(input: PredictionFinderScheduledInputSchema) {
    const response = await this.client.call({
      endpoint: 'scheduled',
      data: input,
    });

    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to call scheduled endpoint',
      };
    }
  }
}
