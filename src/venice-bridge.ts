import { AgentClient, Keypair } from '@torus-network/sdk/agent-client';

import { VENICE_BRIDGE_BASE_URL } from './common';
import { type VeniceChatCompletionsRequest, type VeniceChatCompletionsResponse } from './schemas';

export class VeniceBridgeClient {
  private client: AgentClient;

  constructor(mnemonic: string, baseUrl: string = VENICE_BRIDGE_BASE_URL) {
    const keypair = new Keypair(mnemonic);
    this.client = new AgentClient({ keypair, baseUrl });
  }

  async chatCompletions(
    input: VeniceChatCompletionsRequest,
    agentName = 'venice-bridge',
    step = 'unknown',
  ): Promise<{
    success: boolean;
    data?: VeniceChatCompletionsResponse;
    error?: string;
  }> {
    const response = await this.client.call({
      endpoint: 'chat-completions',
      data: { ...input, agentName, step },
    });

    if (response.success) {
      return {
        success: true,
        data: response.data as VeniceChatCompletionsResponse,
      };
    }
    return {
      success: false,
      error: response.error?.message || 'Failed to call chat-completions endpoint',
    };
  }
}
