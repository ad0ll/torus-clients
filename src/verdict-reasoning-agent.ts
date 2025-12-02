import { AgentClient, Keypair } from '@torus-network/sdk/agent-client';

import { agentPublicConfigs } from './common';
import {
  type VerdictReasoningAgentCreatePredictionVerdictInput,
  type VerdictReasoningAgentCreatePredictionVerdictOutput,
  type VerdictReasoningAgentScheduledInput,
  type VerdictReasoningAgentScheduledOutput,
} from './schemas';

export class VerdictReasoningAgentClient {
  private client: AgentClient;

  constructor(mnemonic: string, baseUrl: string = agentPublicConfigs['verdict-reasoning-agent'].url) {
    const keypair = new Keypair(mnemonic);
    this.client = new AgentClient({
      keypair,
      baseUrl,
    });
    console.log('VerdictReasoningAgentClient initialized at', baseUrl);
  }

  async makeVerdict(input: VerdictReasoningAgentCreatePredictionVerdictInput): Promise<{
    success: boolean;
    data?: VerdictReasoningAgentCreatePredictionVerdictOutput;
    error?: string;
  }> {
    const response = await this.client.call({
      endpoint: 'make-verdict',
      data: input,
    });
    if (response.success) {
      return {
        success: true,
        data: response.data as VerdictReasoningAgentCreatePredictionVerdictOutput,
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to create verdict',
      };
    }
  }

  //Private function, can only be called by private job runner. Do not use.
  async scheduled(input: VerdictReasoningAgentScheduledInput): Promise<{
    success: boolean;
    data?: VerdictReasoningAgentScheduledOutput;
    error?: string;
  }> {
    const response = await this.client.call({
      endpoint: 'scheduled',
      data: input,
    });

    if (response.success) {
      return {
        success: true,
        data: response.data as VerdictReasoningAgentScheduledOutput,
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to run scheduled job',
      };
    }
  }
}
