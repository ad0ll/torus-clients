import { AgentClient, Keypair } from '@torus-network/sdk/agent-client';

import { VERDICT_REASONING_AGENT_BASE_URL } from './common';
import {
  type VerdictReasoningAgentCreatePredictionVerdictInput,
  type VerdictReasoningAgentCreatePredictionVerdictOutput,
  type VerdictReasoningAgentScheduledInput,
  type VerdictReasoningAgentScheduledOutput,
} from './schemas';

export class VerdictReasoningAgentClient {
  private client: AgentClient;

  constructor(mnemonic: string, baseUrl: string = VERDICT_REASONING_AGENT_BASE_URL) {
    const keypair = new Keypair(mnemonic);
    this.client = new AgentClient({
      keypair,
      baseUrl,
    });
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

  async servePapers(input: VerdictReasoningAgentCreatePredictionVerdictInput): Promise<{
    success: boolean;
    data?: VerdictReasoningAgentCreatePredictionVerdictOutput;
    error?: string;
  }> {
    const response = await this.client.call({
      endpoint: 'serve-papers',
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
        error: response.error?.message || 'Failed to serve papers',
      };
    }
  }

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
