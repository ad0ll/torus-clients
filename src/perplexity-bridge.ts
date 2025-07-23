import { AgentClient, Keypair } from '@torus-network/sdk/agent-client';
import {
  type PerplexityBridgeChatCompletionsInput,
  type PerplexityBridgeChatCompletionsOutput,
  type PerplexityBridgeChatCompletionsRawInput,
  type PerplexityBridgeChatCompletionsRawOutput,
} from './schemas';
import { PERPLEXITY_BRIDGE_BASE_URL } from './common';

export class PerplexityBridgeClient {
  private client: AgentClient;

  constructor(mnemonic: string, baseUrl: string = PERPLEXITY_BRIDGE_BASE_URL) {
    const keypair = new Keypair(mnemonic);
    this.client = new AgentClient({ keypair, baseUrl });
  }

  async chatCompletionsRaw(input: PerplexityBridgeChatCompletionsRawInput): Promise<{
    success: boolean;
    data?: PerplexityBridgeChatCompletionsRawOutput;
    error?: string;
  }> {
    const response = await this.client.call({
      endpoint: 'chat-completions-raw',
      data: input,
    });

    if (response.success) {
      return {
        success: true,
        data: response.data as PerplexityBridgeChatCompletionsRawOutput,
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to call chat-completions-raw endpoint',
      };
    }
  }

  async chatCompletions(input: PerplexityBridgeChatCompletionsInput): Promise<{
    success: boolean;
    data?: PerplexityBridgeChatCompletionsOutput;
    error?: string;
  }> {
    const response = await this.client.call({
      endpoint: 'chat-completions',
      data: input,
    });

    if (response.success) {
      return {
        success: true,
        data: response.data as PerplexityBridgeChatCompletionsOutput,
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to call chat-completions endpoint',
      };
    }
  }
}
