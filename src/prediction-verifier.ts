import { AgentClient, Keypair } from '@torus-network/sdk/agent-client';
import {
  type PredictionVerifierScheduledOutput,
  type PredictionVerifierVerifyRawPredictionInput,
  type PredictionVerifierVerifyRawPredictionOutput,
  type PredictionVerifierVerifySwarmPredictionInput,
  type PredictionVerifierVerifySwarmPredictionOutput,
} from './schemas';
import { PREDICTION_VERIFIER_BASE_URL } from './common';

export class PredictionVerifierClient {
  private client: AgentClient;

  constructor(mnemonic: string, baseUrl: string = PREDICTION_VERIFIER_BASE_URL) {
    const keypair = new Keypair(mnemonic);
    this.client = new AgentClient({ keypair, baseUrl });
    console.log('Prediction verifier client running against:', baseUrl);
  }

  async verifySwarmPrediction(input: PredictionVerifierVerifySwarmPredictionInput): Promise<{
    success: boolean;
    data?: PredictionVerifierVerifySwarmPredictionOutput;
    error?: string;
  }> {
    console.log('Verifying prediction:', input);
    const response = await this.client.call({
      endpoint: 'verify-swarm-prediction',
      data: input,
    });
    console.log('Verify prediction response:', response);

    if (response.success) {
      return {
        success: true,
        data: response.data as PredictionVerifierVerifySwarmPredictionOutput,
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to verify prediction',
      };
    }
  }

  async verifyRawPrediction(input: PredictionVerifierVerifyRawPredictionInput): Promise<{
    success: boolean;
    data?: PredictionVerifierVerifyRawPredictionOutput;
    error?: string;
  }> {
    console.log('Verifying raw prediction:', input);
    const response = await this.client.call({
      endpoint: 'verify-raw-prediction',
      data: input,
    });
    console.log('Verify raw prediction response:', response);

    if (response.success) {
      return {
        success: true,
        data: response.data as PredictionVerifierVerifyRawPredictionOutput,
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to verify raw prediction',
      };
    }
  }

  async scheduled(): Promise<{
    success: boolean;
    data?: PredictionVerifierScheduledOutput;
    error?: string;
  }> {
    console.log('Running scheduled verification');
    const response = await this.client.call({
      endpoint: 'scheduled',
      data: {},
    });
    console.log('Scheduled verification response:', response);

    if (response.success) {
      return {
        success: true,
        data: response.data as PredictionVerifierScheduledOutput,
      };
    } else {
      return {
        success: false,
        error: response.error?.message || 'Failed to run scheduled verification',
      };
    }
  }
}
