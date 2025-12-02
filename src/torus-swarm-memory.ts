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
  type InsertSwarmTweetInput,
  insertSwarmTweetsInputSchema,
  type InsertTaskInput,
  insertTaskInputSchema,
  type ListPredictionsInput,
  listPredictionsInputSchema,
  type ListPredictionVerificationClaimsInput,
  listPredictionVerificationClaimsInputSchema,
  listPredictionVerificationVerdictsInputSchema,
  type ListSwarmTweetIdsInput,
  listSwarmTweetIdsInputSchema,
  type ListSwarmTweetsInput,
  listSwarmTweetsInputSchema,
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
  type SwarmTweet,
  type SwarmTweetId,
  type VerificationClaim,
  type VerificationVerdict,
  type VerifyChallengeOutput,
} from './schemas/torus-swarm-memory';

interface RetryOptions {
  attempts?: number; // >= 1, positive, default 1
  failedAttemptBackOff?: number; // > 0, positive, default 3000, in milliseconds
  timeout?: number; // >= 0, positive, default 0 (disabled), in milliseconds
}

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
    enableLogging = false,
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
      this.logger.debug({ config }, 'handleRequest params');
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
  private async handleGetByIdRequest<T>(entityName: string, id: number | string, config: AxiosRequestConfig): Promise<T | null> {
    try {
      return await this.handleRequest<T>(config);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        this.logger.warn(`${entityName} with ID ${id} not found.`);
        this.logger.warn(`${entityName} with ID ${id} not found.`);
        return null;
      }
      throw error;
    }
  }

  // Helper method to handle retry logic with exponential backoff
  private async handleRequestWithRetry<T>(requestFn: () => Promise<T>, retryOptions: RetryOptions = {}): Promise<T> {
    const attempts = Math.max(1, retryOptions.attempts ?? 1);
    const backOffMs = Math.max(0, retryOptions.failedAttemptBackOff ?? 3000);
    const timeoutMs = Math.max(0, retryOptions.timeout ?? 0);

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        let requestPromise = requestFn();

        // Add timeout if specified
        if (timeoutMs > 0) {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs),
          );
          requestPromise = Promise.race([requestPromise, timeoutPromise]);
        }

        return await requestPromise;
      } catch (error) {
        if (attempt === attempts) {
          // This is the final attempt, throw the error
          throw error;
        }

        this.logger.warn(`Request attempt ${attempt}/${attempts} failed, retrying in ${backOffMs}ms`, {
          error: error instanceof Error ? error.message : String(error),
        });

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, backOffMs));
      }
    }

    // This should never be reached, but TypeScript needs it
    throw new Error('Unexpected end of retry logic');
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
      this.logger.debug({ sessionToken: this.sessionToken, tokenExpiration: this.tokenExpiration }, 'Need to refresh auth token');
      this.logger.info('Refreshing authentication token');
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
      headers: this.getHeaders(),
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
      headers: this.getHeaders(),
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
    await this.ensureAuthenticated();
    this.logger.info('Fetching agent contribution stats');
    const { agent_contribution_stats } = await this.handleRequest<AgentContributionStatsOutput>({
      method: 'GET',
      url,
      headers: this.getHeaders(),
    });
    return agent_contribution_stats;
  }

  // GET /api/content-scores/list
  async listContentScores(options: PaginationInput = {}): Promise<ContentScore[]> {
    paginationInputSchema.parse(options);
    await this.ensureAuthenticated();
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
      headers: this.getHeaders(),
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
    await this.ensureAuthenticated();
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
      headers: this.getHeaders(),
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
      `Inserting prediction for tweet_id ${predictionData.tweet_id}`,
    );
    const data = await this.handleRequest<InsertPredictionOutput>({
      method: 'POST',
      url,
      data: predictionData,
      headers: this.getHeaders(),
    });
    this.logger.info({ data }, `Successfully inserted prediction for tweet_id ${predictionData.tweet_id}`);
    return data;
  }

  // GET /api/predictions/list
  async listPredictions(params: ListPredictionsInput = {}, options: RetryOptions = {}): Promise<InsertPredictionOutput[]> {
    listPredictionsInputSchema.parse(params);
    await this.ensureAuthenticated();

    const url = new URL(`${this.baseUrl}/predictions/list`);

    if (params.limit) {
      url.searchParams.append('limit', String(params.limit));
    }
    if (params.offset) {
      url.searchParams.append('offset', String(params.offset));
    }
    if (params.agent_address) {
      url.searchParams.append('agent_address', params.agent_address);
    }
    if (params.from) {
      url.searchParams.append('from', params.from);
    }
    if (params.to) {
      url.searchParams.append('to', params.to);
    }
    if (params.search) {
      url.searchParams.append('search', params.search);
    }
    if (params.sort_by) {
      url.searchParams.append('sort_by', params.sort_by);
    }
    if (params.sort_order) {
      url.searchParams.append('sort_order', params.sort_order);
    }

    this.logger.info(`Listing predictions with params: ${JSON.stringify(params)}`);
    return this.handleRequestWithRetry(
      () =>
        this.handleRequest<InsertPredictionOutput[]>({
          method: 'GET',
          url: url.toString(),
          headers: this.getHeaders(),
        }),
      options,
    );
  }

  // GET /api/predictions/{prediction_id}
  async getPredictionById(predictionId: number, options: RetryOptions = {}): Promise<InsertPredictionOutput | null> {
    await this.ensureAuthenticated();
    const url = `${this.baseUrl}/predictions/${predictionId}`;
    this.logger.info(`Fetching prediction with ID: ${predictionId}`);

    return this.handleRequestWithRetry(
      () =>
        this.handleGetByIdRequest<InsertPredictionOutput>('Prediction', predictionId, {
          method: 'GET',
          url,
          headers: this.getHeaders(),
        }),
      options,
    );
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
  async listPredictionVerificationClaims(
    params: ListPredictionVerificationClaimsInput = {},
    options: RetryOptions = {},
  ): Promise<VerificationClaim[]> {
    listPredictionVerificationClaimsInputSchema.parse(params);
    await this.ensureAuthenticated();
    const url = new URL(`${this.baseUrl}/prediction-verification-claims/list`);
    if (params.limit) {
      url.searchParams.append('limit', String(params.limit));
    }
    if (params.offset) {
      url.searchParams.append('offset', String(params.offset));
    }
    if (params.agent_address) {
      url.searchParams.append('agent_address', params.agent_address);
    }
    if (params.from) {
      url.searchParams.append('from', params.from);
    }
    if (params.to) {
      url.searchParams.append('to', params.to);
    }
    if (params.sort_order) {
      url.searchParams.append('sort_order', params.sort_order);
    }

    this.logger.info(`Listing prediction verification claims with params: ${JSON.stringify(params)}`);
    return this.handleRequestWithRetry(
      () =>
        this.handleRequest<VerificationClaim[]>({
          method: 'GET',
          url: url.toString(),
          headers: this.getHeaders(),
        }),
      options,
    );
  }

  // GET /api/prediction-verification-claims/{claim_id}
  async getPredictionVerificationClaimById(claimId: number): Promise<VerificationClaim | null> {
    await this.ensureAuthenticated();
    const url = `${this.baseUrl}/prediction-verification-claims/${claimId}`;
    this.logger.info(`Fetching prediction verification claim with ID: ${claimId}`);
    return this.handleGetByIdRequest<VerificationClaim>('VerificationClaim', claimId, {
      method: 'GET',
      url,
      headers: this.getHeaders(),
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
    await this.ensureAuthenticated();

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
      headers: this.getHeaders(),
    });
  }

  // GET /api/prediction-verification-verdicts/{verdict_id}
  async getPredictionVerificationVerdictById(verdictId: number): Promise<VerificationVerdict | null> {
    const url = `${this.baseUrl}/prediction-verification-verdicts/${verdictId}`;
    await this.ensureAuthenticated();
    this.logger.info(`Fetching prediction verification verdict with ID: ${verdictId}`);
    return this.handleGetByIdRequest<VerificationVerdict>('VerificationVerdict', verdictId, {
      method: 'GET',
      url,
      headers: this.getHeaders(),
    });
  }

  // GET /api/tasks/list
  async listTasks(options: ListTasksInput): Promise<SwarmTask[]> {
    listTasksInputSchema.parse(options);
    await this.ensureAuthenticated();
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
      headers: this.getHeaders(),
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

  // POST /api/tweets/insert
  async insertSwarmTweets(tweets: InsertSwarmTweetInput[]): Promise<SwarmTweet[]> {
    insertSwarmTweetsInputSchema.parse(tweets);
    await this.ensureAuthenticated();
    const url = `${this.baseUrl}/tweets/insert`;
    this.logger.info(`Inserting ${tweets.length} tweets`);
    return this.handleRequest<SwarmTweet[]>({
      method: 'POST',
      url,
      data: tweets,
      headers: this.getHeaders(),
    });
  }

  // GET /api/tweets/{id}
  async getSwarmTweetById(id: string, options: RetryOptions = {}): Promise<SwarmTweet | null> {
    await this.ensureAuthenticated();
    const url = `${this.baseUrl}/tweets/${id}`;
    this.logger.info(`Fetching tweet with ID: ${id}`);
    return this.handleRequestWithRetry(
      () =>
        this.handleGetByIdRequest<SwarmTweet>('Tweet', id, {
          method: 'GET',
          url,
          headers: this.getHeaders(),
        }),
      options,
    );
  }

  // GET /api/tweets/list
  async listSwarmTweets(params: ListSwarmTweetsInput = {}, options: RetryOptions = {}): Promise<SwarmTweet[]> {
    listSwarmTweetsInputSchema.parse(params);
    await this.ensureAuthenticated();
    const url = new URL(`${this.baseUrl}/tweets/list`);

    if (params.limit) {
      url.searchParams.append('limit', String(params.limit));
    }
    if (params.offset) {
      url.searchParams.append('offset', String(params.offset));
    }
    if (params.agent_address) {
      url.searchParams.append('agent_address', params.agent_address);
    }
    if (params.from) {
      url.searchParams.append('from', params.from);
    }
    if (params.to) {
      url.searchParams.append('to', params.to);
    }
    if (params.author_twitter_username) {
      url.searchParams.append('author_twitter_username', params.author_twitter_username);
    }
    if (params.search) {
      url.searchParams.append('search', params.search);
    }
    if (params.sort_order) {
      url.searchParams.append('sort_order', params.sort_order);
    }

    this.logger.info(`Listing tweets with params: ${JSON.stringify(params)}`);
    return this.handleRequestWithRetry(
      () =>
        this.handleRequest<SwarmTweet[]>({
          method: 'GET',
          url: url.toString(),
          headers: this.getHeaders(),
        }),
      options,
    );
  }

  // GET /api/tweets/ids
  async listSwarmTweetIds(params: ListSwarmTweetIdsInput = {}, options: RetryOptions = {}): Promise<SwarmTweetId[]> {
    listSwarmTweetIdsInputSchema.parse(params);
    await this.ensureAuthenticated();
    const url = new URL(`${this.baseUrl}/tweets/ids`);
    if (params.author_twitter_username) {
      url.searchParams.append('author_twitter_username', params.author_twitter_username);
    }

    this.logger.info(`Listing tweet IDs with params: ${JSON.stringify(params)}`);
    return this.handleRequestWithRetry(
      () =>
        this.handleRequest<SwarmTweetId[]>({
          method: 'GET',
          url: url.toString(),
          headers: this.getHeaders(),
        }),
      options,
    );
  }
}
