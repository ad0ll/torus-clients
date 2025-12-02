import { AgentClient, Keypair } from '@torus-network/sdk/agent-client';

import { agentPublicConfigs } from './common';
import {
  CheckPredictionVerifiabilityInput,
  CheckPredictionVerifiabilityOutput,
  CheckVerifiabilitySwarmInput,
  CheckVerifiabilitySwarmOutput,
} from './schemas';

export class PredictionVerifiabilityCheckerClient {
  private client: AgentClient;

  constructor(mnemonic: string, baseUrl: string = agentPublicConfigs['prediction-verifiability-checker'].url) {
    const keypair = new Keypair(mnemonic);
    this.client = new AgentClient({ keypair, baseUrl });
    console.log('PredictionVerifiabilityCheckerClient initialized at', baseUrl);
  }

  async checkVerifiability(input: CheckPredictionVerifiabilityInput): Promise<{
    success: boolean;
    data?: CheckPredictionVerifiabilityOutput;
    error?: string;
  }> {
    const response = await this.client.call({
      endpoint: 'check-verifiability',
      data: input,
    });

    if (response.success) {
      return {
        success: true,
        data: response.data as CheckPredictionVerifiabilityOutput,
      };
    }
    return {
      success: false,
      error: response.error?.message || 'Failed to call check-verifiability endpoint',
    };
  }

  async checkVerifiabilitySwarm(input: CheckVerifiabilitySwarmInput): Promise<{
    success: boolean;
    data?: CheckVerifiabilitySwarmOutput;
    error?: string;
  }> {
    const response = await this.client.call({
      endpoint: 'check-verifiability.swarm',
      data: input,
    });

    if (response.success) {
      return {
        success: true,
        data: response.data as CheckVerifiabilitySwarmOutput,
      };
    }
    return {
      success: false,
      error: response.error?.message || 'Failed to call check-verifiability.swarm endpoint',
    };
  }
}
