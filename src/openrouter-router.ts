import { AgentClient, Keypair } from '@torus-network/sdk/agent-client';

import { OPENROUTER_ROUTER_BASE_URL } from './common';
import {
  type OpenrouterChatCompletionsInput,
  type OpenrouterChatCompletionsOutput,
  type OpenrouterCompletionsInput,
  type OpenrouterCompletionsOutput,
} from './schemas';

export class OpenrouterRouterClient {
  private client: AgentClient;

  constructor(mnemonic: string, baseUrl: string = OPENROUTER_ROUTER_BASE_URL) {
    const keypair = new Keypair(mnemonic);
    this.client = new AgentClient({ keypair, baseUrl });
  }

  async completions(input: OpenrouterCompletionsInput): Promise<{
    success: boolean;
    data?: OpenrouterCompletionsOutput;
    error?: string;
  }> {
    const response = await this.client.call({
      endpoint: 'completions',
      data: input,
    });

    if (response.success) {
      return {
        success: true,
        data: response.data as OpenrouterCompletionsOutput,
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to call completions endpoint',
      };
    }
  }

  async chatCompletions(input: OpenrouterChatCompletionsInput): Promise<{
    success: boolean;
    data?: OpenrouterChatCompletionsOutput;
    error?: string;
  }> {
    const response = await this.client.call({
      endpoint: 'chat-completions',
      data: input,
    });

    if (response.success) {
      return {
        success: true,
        data: response.data as OpenrouterChatCompletionsOutput,
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to call chat-completions endpoint',
      };
    }
  }
}
