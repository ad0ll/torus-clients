import { AgentClient, Keypair } from '@torus-network/sdk/agent-client';

import { VERDICT_REASONING_BASE_URL } from './common';
import {
  type VerdictReasoningAgentCreatePredictionVerdictInput,
  type VerdictReasoningAgentCreatePredictionVerdictOutput,
  type VerdictReasoningAgentScheduledInput,
  type VerdictReasoningAgentScheduledOutput,
} from './schemas';

export class VerdictReasoningAgentClient {
  private client: AgentClient;

  constructor(mnemonic: string, baseUrl: string = VERDICT_REASONING_BASE_URL) {
    const keypair = new Keypair(mnemonic);
    console.log(`VerdictReasoningAgentClient sending requests to: ${baseUrl}`);
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
    console.log('input', input);
    const response = await this.client.call({
      endpoint: 'make-verdict',
      data: input,
    });
    console.log('response for verdict', response);

    console.log('response', response);
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

  //Same exact function as makeVerdict, but with more gusto
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
