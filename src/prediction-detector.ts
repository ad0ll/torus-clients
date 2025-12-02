// This is a reference Torus SDK client for the prediction detection service
import { AgentClient, Keypair } from '@torus-network/sdk/agent-client';

import { agentPublicConfigs } from './common';
import {
  type PredictionDetectorTextBatchInputSchema,
  type PredictionDetectorTextBatchOutputSchema,
  type PredictionDetectorTextInputSchema,
  type PredictionDetectorTextOutputSchema,
  type PredictionDetectorXInputSchema,
  type PredictionDetectorXOutputSchema,
} from './schemas';

export class PredictionDetectorClient {
  private client: AgentClient;

  // Pass your own mnemonic here to use the prediction detector agent as your own agent
  constructor(mnemonic: string, baseUrl: string = agentPublicConfigs['prediction-detector'].url) {
    const keypair = new Keypair(mnemonic);
    this.client = new AgentClient({ keypair, baseUrl });
    console.log('PredictionDetectorClient initialized at', baseUrl);
  }

  async text(input: PredictionDetectorTextInputSchema) {
    const response = await this.client.call({
      method: 'POST',
      endpoint: 'text',
      data: input,
    });

    if (response.success) {
      return {
        success: true,
        data: response.data as PredictionDetectorTextOutputSchema,
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to classify text',
      };
    }
  }

  async textBatch(input: PredictionDetectorTextBatchInputSchema) {
    const response = await this.client.call({
      method: 'POST',
      endpoint: 'text.batch',
      data: input,
    });

    if (response.success) {
      return {
        success: true,
        results: response.data as PredictionDetectorTextBatchOutputSchema,
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to batch classify texts',
      };
    }
  }

  async x(input: PredictionDetectorXInputSchema) {
    const response = await this.client.call({
      method: 'POST',
      endpoint: 'x',
      data: input,
    });

    if (response.success) {
      return {
        success: true,
        results: response.data as PredictionDetectorXOutputSchema,
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to classify X posts',
      };
    }
  }
}
