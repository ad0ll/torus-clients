import { Keyring } from '@polkadot/keyring';
import { type KeyringPair } from '@polkadot/keyring/types';
import { u8aToHex } from '@polkadot/util';
import axios, { type AxiosRequestConfig } from 'axios';
import pino from 'pino';

import { logger as defaultLogger } from './common';
import {
  // Types and enums for re-export and internal use
  type AgentContributionStats,
  type AgentContributionStatsOutput,
  type ClaimTaskInput,
  // Zod schemas for validation
  claimTaskInputSchema,
  type ContentScore,
  type CreateChallengeOutput,
  type InsertContentScoreInput,
  insertContentScoreInputSchema,
  type InsertPredictionInput,
  insertPredictionInputSchema,
  type InsertPredictionOutput,
  type InsertPredictionVerificationClaimInput,
  insertPredictionVerificationClaimInputSchema,
  type InsertPredictionVerificationVerdictInput,
  insertPredictionVerificationVerdictInputSchema,
  type InsertTaskInput,
  insertTaskInputSchema,
  listPredictionVerificationVerdictsInputSchema,
  type ListTasksInput,
  listTasksInputSchema,
  type LogoutAllOutput,
  type PaginationInput,
  paginationInputSchema,
  type Session,
  type SetPredictionContextInput,
  setPredictionContextInputSchema,
  type SwarmPermission,
  type SwarmTask,
  type VerificationClaim,
  type VerificationVerdict,
  type VerifyChallengeOutput,
} from './schemas/torus-swarm-memory';

export class TorusSwarmMemoryClient {
  private readonly baseUrl: string;
  private readonly keyring: Keyring;
  private readonly keypair: KeyringPair;
  private readonly logger: pino.Logger;

  private sessionToken: string | null = null;
  private tokenExpiration: Date | null = null;

  constructor({
    walletSeedPhrase,
    baseUrl = 'https://memory.sension.torus.directory/api',
    enableLogging = true,
  }: {
    walletSeedPhrase: string;
    baseUrl?: string;
    enableLogging?: boolean;
  }) {
    this.baseUrl = baseUrl;
    this.keyring = new Keyring({ type: 'sr25519' });
    this.keypair = this.keyring.addFromUri(walletSeedPhrase);
    if (enableLogging) {
      this.logger = defaultLogger;
    } else {
      this.logger = pino({ enabled: false });
    }
  }

  // Generic request handler that makes a request to Swarm Memory with Axios
  // and then logs the error w/o Axios noise and then throws it
  private async handleRequest<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const { data } = await axios<T>(config);
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const { url, data: payload } = error.config || {};
        const errorMessage = `Axios error: ${error.message}. Server response: ${JSON.stringify(error.response?.data)}`;
        this.logger.error({ url, payload }, errorMessage);
        this.logger.trace({ error }, `Full error details`);
      } else {
        this.logger.error({ payload: config.data }, `Unexpected error: ${error}`);
      }
      throw error;
    }
  }

  // Separate variation of handleRequests that handles 404 errors gracefully.
  private async handleGetByIdRequest<T>(entityName: string, id: number, config: AxiosRequestConfig): Promise<T | null> {
    try {
      return await this.handleRequest<T>(config);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        this.logger.warn(`${entityName} with ID ${id} not found.`);
        return null;
      }
      throw error;
    }
  }

  // Full authentication flow
  private async authenticate(): Promise<void> {
    try {
      this.logger.info(`Authenticating with Torus Swarm Memory using wallet address: ${this.keypair.address}`);

      const challengeData = await this.createChallenge();
      if (!challengeData) {
        throw new Error('Failed to get authentication challenge.');
      }

      const { challenge_token, message } = challengeData;
      this.logger.debug({ challenge_token, message }, 'Received challenge response');

      const signature = u8aToHex(this.keypair.sign(message)).slice(2);
      this.logger.debug(`Generated signature: ${signature}`);

      const verifyData = await this.verifyChallenge(challenge_token, signature);

      this.sessionToken = verifyData.session_token;
      this.tokenExpiration = new Date(verifyData.expires_at);
      this.logger.info('Authentication successful');
    } catch (error) {
      this.logger.error('Authentication failed', error instanceof Error ? { message: error.message } : { error });
      throw new Error('Authentication failed');
    }
  }

  // Preflight to check that the user is authenticated when authentication is required
  private async ensureAuthenticated(): Promise<void> {
    const shouldRefresh =
      !this.sessionToken || !this.tokenExpiration || this.tokenExpiration.getTime() - new Date().getTime() < 15 * 60 * 1000;

    if (shouldRefresh) {
      await this.authenticate();
    }
  }

  // Attach common headers to all requests
  private getHeaders(): Record<string, string> {
    if (!this.sessionToken) {
      return {};
    }
    return {
      Authorization: `Bearer ${this.sessionToken}`,
      'Content-Type': 'application/json',
    };
  }

  // POST /api/auth/challenge
  private async createChallenge(): Promise<CreateChallengeOutput> {
    const url = `${this.baseUrl}/auth/challenge`;
    const payload = { wallet_address: this.keypair.address };
    this.logger.debug('Creating challenge');
    const data = await this.handleRequest<CreateChallengeOutput>({
      method: 'POST',
      url,
      data: payload,
    });
    this.logger.debug({ data }, 'Received challenge response');
    return data;
  }

  // POST /api/auth/verify
  private async verifyChallenge(challenge_token: string, signature: string): Promise<VerifyChallengeOutput> {
    const url = `${this.baseUrl}/auth/verify`;
    const payload = { challenge_token, signature };
    this.logger.debug('Verifying challenge');
    const data = await this.handleRequest<VerifyChallengeOutput>({
      method: 'POST',
      url,
      data: payload,
    });
    this.logger.debug('Challenge verification successful');
    return data;
  }

  // POST /api/auth/logout
  async logout(): Promise<void> {
    await this.ensureAuthenticated();
    const url = `${this.baseUrl}/auth/logout`;
    this.logger.info('Logging out');
    await this.handleRequest<void>({
      method: 'POST',
      url,
      headers: this.getHeaders(),
    });
    this.sessionToken = null;
    this.tokenExpiration = null;
  }

  // POST /api/auth/logout-all
  async logoutAll(): Promise<LogoutAllOutput> {
    await this.ensureAuthenticated();
    const url = `${this.baseUrl}/auth/logout-all`;
    this.logger.info('Logging out from all sessions');
    const result = await this.handleRequest<LogoutAllOutput>({
      method: 'POST',
      url,
      headers: this.getHeaders(),
    });
    this.sessionToken = null;
    this.tokenExpiration = null;
    return result;
  }

  // GET /api/auth/sessions
  async getSessions(): Promise<Session[]> {
    await this.ensureAuthenticated();
    const url = `${this.baseUrl}/auth/sessions`;
    this.logger.info('Fetching sessions');
    return this.handleRequest<Session[]>({
      method: 'GET',
      url,
      headers: this.getHeaders(),
    });
  }

  // GET /api/agent-contribution-stats
  async getAgentContributionStats(): Promise<AgentContributionStats[]> {
    const url = `${this.baseUrl}/agent-contribution-stats`;
    this.logger.info('Fetching agent contribution stats');
    const { agent_contribution_stats } = await this.handleRequest<AgentContributionStatsOutput>({
      method: 'GET',
      url,
    });
    return agent_contribution_stats;
  }

  // GET /api/content-scores/list
  async listContentScores(options: PaginationInput = {}): Promise<ContentScore[]> {
    paginationInputSchema.parse(options);
    const url = new URL(`${this.baseUrl}/content-scores/list`);
    if (options.limit) {
      url.searchParams.append('limit', String(options.limit));
    }
    if (options.offset) {
      url.searchParams.append('offset', String(options.offset));
    }
    if (options.agent_address) {
      url.searchParams.append('agent_address', options.agent_address);
    }
    if (options.from) {
      url.searchParams.append('from', options.from);
    }
    if (options.to) {
      url.searchParams.append('to', options.to);
    }

    this.logger.info(`Listing content scores with options: ${JSON.stringify(options)}`);
    return this.handleRequest<ContentScore[]>({
      method: 'GET',
      url: url.toString(),
    });
  }

  // POST /api/content-scores/insert
  async insertContentScore(scoreData: InsertContentScoreInput): Promise<unknown> {
    insertContentScoreInputSchema.parse(scoreData);
    await this.ensureAuthenticated();
    // TODO: The schema is null in the docs, but we should fix this if it turns out it does return something later.
    const url = `${this.baseUrl}/content-scores/insert`;
    this.logger.info(`Inserting content score for content_id: ${scoreData.content_id}`);
    return this.handleRequest<unknown>({
      method: 'POST',
      url,
      data: scoreData,
      headers: this.getHeaders(),
    });
  }

  // GET /api/permissions/list
  async listPermissions(options: PaginationInput = {}): Promise<SwarmPermission[]> {
    paginationInputSchema.parse(options);
    const url = new URL(`${this.baseUrl}/permissions/list`);

    if (options.limit) {
      url.searchParams.append('limit', String(options.limit));
    }
    if (options.offset) {
      url.searchParams.append('offset', String(options.offset));
    }
    if (options.agent_address) {
      url.searchParams.append('agent_address', options.agent_address);
    }
    if (options.from) {
      url.searchParams.append('from', options.from);
    }
    if (options.to) {
      url.searchParams.append('to', options.to);
    }

    this.logger.info(`Listing permissions with options: ${JSON.stringify(options)}`);
    return this.handleRequest<SwarmPermission[]>({
      method: 'GET',
      url: url.toString(),
    });
  }

  // POST /api/predictions/insert
  async insertPrediction(predictionData: InsertPredictionInput): Promise<InsertPredictionOutput> {
    insertPredictionInputSchema.parse(predictionData);
    await this.ensureAuthenticated();
    const url = `${this.baseUrl}/predictions/insert`;
    this.logger.info(
      {
        predictionData,
      },
      `Inserting prediction for ${predictionData.url}`,
    );
    const data = await this.handleRequest<InsertPredictionOutput>({
      method: 'POST',
      url,
      data: predictionData,
      headers: this.getHeaders(),
    });
    this.logger.info({ data }, `Successfully inserted prediction for ${predictionData.url}`);
    return data;
  }

  // GET /api/predictions/list
  async listPredictions(options: PaginationInput = {}): Promise<InsertPredictionOutput[]> {
    paginationInputSchema.parse(options);
    const url = new URL(`${this.baseUrl}/predictions/list`);

    if (options.limit) {
      url.searchParams.append('limit', String(options.limit));
    }
    if (options.offset) {
      url.searchParams.append('offset', String(options.offset));
    }
    if (options.agent_address) {
      url.searchParams.append('agent_address', options.agent_address);
    }
    if (options.from) {
      url.searchParams.append('from', options.from);
    }
    if (options.to) {
      url.searchParams.append('to', options.to);
    }

    this.logger.info(`Listing predictions with options: ${JSON.stringify(options)}`);
    return this.handleRequest<InsertPredictionOutput[]>({
      method: 'GET',
      url: url.toString(),
    });
  }

  // GET /api/predictions/{prediction_id}
  async getPredictionById(predictionId: number): Promise<InsertPredictionOutput | null> {
    const url = `${this.baseUrl}/predictions/${predictionId}`;
    this.logger.info(`Fetching prediction with ID: ${predictionId}`);
    return this.handleGetByIdRequest<InsertPredictionOutput>('Prediction', predictionId, {
      method: 'GET',
      url,
    });
  }

  // POST /api/predictions/set-context
  async setPredictionContext(contextData: SetPredictionContextInput): Promise<InsertPredictionOutput> {
    setPredictionContextInputSchema.parse(contextData);
    await this.ensureAuthenticated();
    const url = `${this.baseUrl}/predictions/set-context`;
    this.logger.info(
      {
        contextData,
      },
      `Setting context for prediction ${contextData.prediction_id}`,
    );
    const data = await this.handleRequest<InsertPredictionOutput>({
      method: 'POST',
      url,
      data: contextData,
      headers: this.getHeaders(),
    });
    this.logger.info({ data }, `Successfully set context for prediction ${contextData.prediction_id}`);
    return data;
  }

  // POST /api/prediction-verification-claims/insert
  async insertPredictionVerificationClaim(claimData: InsertPredictionVerificationClaimInput): Promise<InsertPredictionOutput> {
    insertPredictionVerificationClaimInputSchema.parse(claimData);
    await this.ensureAuthenticated();
    const url = `${this.baseUrl}/prediction-verification-claims/insert`;
    this.logger.info(
      `Inserting prediction verification claim for prediction_id: ${claimData.prediction_id},
        my address: ${this.keypair.address}`,
    );
    return this.handleRequest<InsertPredictionOutput>({
      method: 'POST',
      url,
      data: claimData,
      headers: this.getHeaders(),
    });
  }

  // GET /api/prediction-verification-claims/list
  async listPredictionVerificationClaims(options: PaginationInput = {}): Promise<VerificationClaim[]> {
    paginationInputSchema.parse(options);
    const url = new URL(`${this.baseUrl}/prediction-verification-claims/list`);
    if (options.limit) {
      url.searchParams.append('limit', String(options.limit));
    }
    if (options.offset) {
      url.searchParams.append('offset', String(options.offset));
    }
    if (options.agent_address) {
      url.searchParams.append('agent_address', options.agent_address);
    }
    if (options.from) {
      url.searchParams.append('from', options.from);
    }
    if (options.to) {
      url.searchParams.append('to', options.to);
    }

    this.logger.info(`Listing prediction verification claims with options: ${JSON.stringify(options)}`);
    return this.handleRequest<VerificationClaim[]>({
      method: 'GET',
      url: url.toString(),
    });
  }

  // GET /api/prediction-verification-claims/{claim_id}
  async getPredictionVerificationClaimById(claimId: number): Promise<VerificationClaim | null> {
    const url = `${this.baseUrl}/prediction-verification-claims/${claimId}`;
    this.logger.info(`Fetching prediction verification claim with ID: ${claimId}`);
    return this.handleGetByIdRequest<VerificationClaim>('VerificationClaim', claimId, {
      method: 'GET',
      url,
    });
  }

  // POST /api/prediction-verification-verdicts/upsert
  async upsertPredictionVerificationVerdict(verdictData: InsertPredictionVerificationVerdictInput): Promise<VerificationVerdict> {
    insertPredictionVerificationVerdictInputSchema.parse(verdictData);
    await this.ensureAuthenticated();
    const url = `${this.baseUrl}/prediction-verification-verdicts/upsert`;
    this.logger.info(
      `Inserting prediction verification verdict for prediction_id: ${verdictData.prediction_id}, my address: ${this.keypair.address}`,
    );
    this.logger.debug({ url }, 'swarm rest api path');
    this.logger.debug({ verdictData }, 'verdictData');
    return this.handleRequest<VerificationVerdict>({
      method: 'POST',
      url,
      data: verdictData,
      headers: this.getHeaders(),
    });
  }

  // GET /api/prediction-verification-verdicts/list
  async listPredictionVerificationVerdicts(options: PaginationInput = {}): Promise<VerificationVerdict[]> {
    listPredictionVerificationVerdictsInputSchema.parse(options);
    const url = new URL(`${this.baseUrl}/prediction-verification-verdicts/list`);
    if (options.limit) {
      url.searchParams.append('limit', String(options.limit));
    }
    if (options.offset) {
      url.searchParams.append('offset', String(options.offset));
    }
    if (options.agent_address) {
      url.searchParams.append('agent_address', options.agent_address);
    }
    if (options.from) {
      url.searchParams.append('from', options.from);
    }
    if (options.to) {
      url.searchParams.append('to', options.to);
    }
    this.logger.info(`Listing prediction verification verdicts with options: ${JSON.stringify(options)}`);
    return this.handleRequest<VerificationVerdict[]>({
      method: 'GET',
      url: url.toString(),
    });
  }

  // GET /api/prediction-verification-verdicts/{verdict_id}
  async getPredictionVerificationVerdictById(verdictId: number): Promise<VerificationVerdict | null> {
    const url = `${this.baseUrl}/prediction-verification-verdicts/${verdictId}`;
    this.logger.info(`Fetching prediction verification verdict with ID: ${verdictId}`);
    return this.handleGetByIdRequest<VerificationVerdict>('VerificationVerdict', verdictId, {
      method: 'GET',
      url,
    });
  }

  // GET /api/tasks/list
  async listTasks(options: ListTasksInput): Promise<SwarmTask[]> {
    listTasksInputSchema.parse(options);
    const url = new URL(`${this.baseUrl}/tasks/list`);
    if (options.limit) {
      url.searchParams.append('limit', String(options.limit));
    }
    if (options.offset) {
      url.searchParams.append('offset', String(options.offset));
    }
    if (options.agent_address) {
      url.searchParams.append('agent_address', options.agent_address);
    }
    if (options.from) {
      url.searchParams.append('from', options.from);
    }
    if (options.to) {
      url.searchParams.append('to', options.to);
    }
    if (options.sort_by_priority_desc) {
      url.searchParams.append('sort_by_priority_desc', String(options.sort_by_priority_desc));
    }
    this.logger.info(`Listing tasks with options: ${JSON.stringify(options)}`);
    return this.handleRequest<SwarmTask[]>({
      method: 'GET',
      url: url.toString(),
    });
  }

  // POST /api/tasks/claim
  async claimTask(claimTaskInput: ClaimTaskInput): Promise<SwarmTask> {
    claimTaskInputSchema.parse(claimTaskInput);
    await this.ensureAuthenticated();
    const url = `${this.baseUrl}/tasks/claim`;
    this.logger.info(`Claiming task with ID: ${claimTaskInput.task_id}`);
    return this.handleRequest<SwarmTask>({
      method: 'POST',
      url,
      data: claimTaskInput,
      headers: this.getHeaders(),
    });
  }

  // POST /api/tasks/complete
  async completeTask(claimTaskInput: ClaimTaskInput): Promise<SwarmTask> {
    claimTaskInputSchema.parse(claimTaskInput);
    await this.ensureAuthenticated();
    const url = `${this.baseUrl}/tasks/complete`;
    this.logger.info(`Completing task with ID: ${claimTaskInput.task_id}`);
    return this.handleRequest<SwarmTask>({
      method: 'POST',
      url,
      data: claimTaskInput,
      headers: this.getHeaders(),
    });
  }

  // POST /api/tasks/insert
  async insertTask(insertTaskInput: InsertTaskInput): Promise<SwarmTask> {
    insertTaskInputSchema.parse(insertTaskInput);
    await this.ensureAuthenticated();
    const url = `${this.baseUrl}/tasks/insert`;
    this.logger.info(`Inserting new task`);
    return this.handleRequest<SwarmTask>({
      method: 'POST',
      url,
      data: insertTaskInput,
      headers: this.getHeaders(),
    });
  }
}
