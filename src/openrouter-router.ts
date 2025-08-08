import { AgentClient, Keypair } from '@torus-network/sdk/agent-client';

import { agentPublicConfigs } from './common';
import {
  type OpenrouterChatCompletionsInput,
  type OpenrouterChatCompletionsOutput,
  type OpenrouterCompletionsInput,
  type OpenrouterCompletionsOutput,
} from './schemas';

export class OpenrouterRouterClient {
  private client: AgentClient;

  constructor(mnemonic: string, baseUrl: string = agentPublicConfigs['openrouter-router'].url) {
    const keypair = new Keypair(mnemonic);
    this.client = new AgentClient({ keypair, baseUrl });
  }

  async completions(
    input: OpenrouterCompletionsInput,
    agentName = 'openrouter-router',
    step = 'unknown',
  ): Promise<{
    success: boolean;
    data?: OpenrouterCompletionsOutput;
    error?: string;
  }> {
    const response = await this.client.call({
      endpoint: 'completions',
      data: { ...input, agentName, step },
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

  async chatCompletions(
    input: OpenrouterChatCompletionsInput,
    agentName = 'openrouter-router',
    step = 'unknown',
  ): Promise<{
    success: boolean;
    data?: OpenrouterChatCompletionsOutput;
    error?: string;
  }> {
    const response = await this.client.call({
      endpoint: 'chat-completions',
      data: { ...input, agentName, step },
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
