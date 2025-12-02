import { z } from 'zod';

// Schemas that are not bound to a specific endpoint
export enum PredictionOutcome {
  NotMatured = 'NotMatured',
  MaturedTrue = 'MaturedTrue',
  MaturedFalse = 'MaturedFalse',
  MaturedMostlyTrue = 'MaturedMostlyTrue',
  Invalid = 'Invalid',
  MissingContext = 'MissingContext',
}

export const predictionOutcomeSchema = z.nativeEnum(PredictionOutcome);
export const paginationInputSchema = z.object({
  agent_address: z.string().nullable().optional().describe('Filter by agent address'),
  from: z.string().nullable().optional().describe('Time window filter: start of the time window'),
  to: z.string().nullable().optional().describe('Time window filter: end of the time window'),
  limit: z.number().int().positive().nullable().optional().describe('Pagination limit'),
  offset: z.number().int().nonnegative().nullable().optional().describe('Pagination offset'),
});

// /api/agent-contribution-stats
export const agentContributionStatsSchema = z.object({
  num_predictions_submitted: z.number().describe('The number of predictions submitted by the agent'),
  num_verification_claims_submitted: z.number().describe('The number of verification claims submitted by the agent'),
  num_verification_claims_verified_by_other_agents: z
    .number()
    .describe(
      'The number of verification claims submitted by the agent that are verified by a verdict that was submitted by another agent',
    ),
  num_verification_verdicts_submitted: z.number().describe('The number of verification verdicts submitted by the agent'),
  wallet_address: z.string().describe('The wallet address of the agent'),
});
export const agentContributionStatsOutputSchema = z.object({
  agent_contribution_stats: z.array(agentContributionStatsSchema),
});

// /api/auth
export const createChallengeOutputSchema = z.object({
  challenge_token: z.string(),
  expires_at: z.string(),
  message: z.string(),
});
export const verifyChallengeOutputSchema = z.object({
  session_token: z.string(),
  expires_at: z.string(),
});
export const logoutAllOutputSchema = z.number().int().min(0);
export const sessionSchema = z.object({
  created_at: z.string(),
  expires_at: z.string(),
  id: z.number().int(),
  activated_at: z.string().nullable(),
  last_accessed: z.string().nullable(),
});
export const sessionsSchema = z.array(sessionSchema);

// /api/content-scores
export const contentTypeSchema = z.enum(['Prediction', 'PredictionVerificationClaim', 'PredictionVerificationVerdict']);
export const insertContentScoreInputSchema = z.object({
  content_id: z.number().describe('The ID of the content to score'),
  content_type: contentTypeSchema.describe('The type of the content to score'),
  reasoning: z.string().describe('The reasoning for the score, e.g. duplicate, junk content ("tweet contains no prediction"), etc.'),
  score: z.number().min(0).max(1).describe('The score between 0 and 1 (0 = as bad as it can be, 1 = as good as it can be)'),
});
export const contentScoreSchema = z.object({
  content_id: z.number().describe('The ID of the content'),
  content_type: contentTypeSchema.describe('The type of the content'),
  id: z.number().describe('The ID of the content score'),
  inserted_at: z.string().describe('The timestamp when the content score was inserted'),
  inserted_by_address: z.string().describe('The wallet address of the agent who inserted the content score'),
  reasoning: z.string().describe('The reasoning for the score, e.g. duplicate, junk content ("tweet contains no prediction"), etc.'),
  score: z.number().min(0).max(1).describe('The score between 0 and 1 (0 = as bad as it can be, 1 = as good as it can be)'),
});

// /api/permissions
export const permissionSchema = z.object({
  created_at: z.string(),
  id: z.number().int(),
  permission: z.enum([
    'InsertAuthorizedAgents',
    'InsertPredictions',
    'InsertVerificationClaims',
    'InsertVerificationVerdicts',
    'InsertTasks',
    'AddPredictionContext',
  ]),
  ss58_address: z.string(),
});
export const permissionsSchema = z.array(permissionSchema);

// /api/tweets
export const swarmTweetTypeSchema = z.enum(['post', 'reply', 'quote', 'retweet']);
export const swarmTweetInputSchema = z.object({
  author_twitter_user_id: z.string().nullable().describe("The author's 64-bit user snowflake ID (as a decimal string), if available"),
  author_twitter_username: z.string().describe("The author's Twitter/X username (without '@')"),
  conversation_id: z.string().nullable().describe('Conversation/thread identifier (snowflake as string), if provided by API'),
  full_text: z.string().describe('The full text content of the tweet'),
  in_reply_to_tweet_id: z.string().nullable().describe('If this tweet is a reply, the parent tweet ID (snowflake as string)'),
  quoted_tweet_id: z.string().nullable().describe('If this tweet quotes another, the quoted tweet ID (snowflake as string)'),
  raw_json: z.string().describe('Raw JSON payload as returned by the Twitter/X API for this tweet'),
  retweeted_tweet_id: z.string().nullable().describe('If this tweet is a retweet, the retweeted tweet ID (snowflake as string)'),
  tweet_id: z.string().describe("The Tweet's 64-bit snowflake ID (as a decimal string)"),
  tweet_timestamp: z.string().describe('Timestamp when the tweet was created (RFC3339)'),
  tweet_type: swarmTweetTypeSchema.describe('The tweet type: post | reply | quote | retweet'),
  url: z.string().url().describe('The canonical URL of the tweet'),
});
export const insertSwarmTweetsInputSchema = z.array(swarmTweetInputSchema);
export const swarmTweetSchema = swarmTweetInputSchema.extend({
  id: z.number().int().describe('The internal row ID of the tweet'),
  inserted_at: z.string().describe('The timestamp when the tweet was inserted'),
  inserted_by_address: z.string().describe('The wallet address of the agent who inserted the tweet'),
});
export const listSwarmTweetsInputSchema = paginationInputSchema.extend({
  author_twitter_username: z
    .string()
    .nullable()
    .optional()
    .describe("Filter by author's Twitter/X username (with or without '@', case-insensitive)"),
  search: z.string().nullable().optional().describe('Text search filter (case-insensitive, searches relevant content fields)'),
  sort_order: z.enum(['asc', 'desc']).nullable().optional().describe('Sort order by ID/insertion timestamp (default: Asc)'),
});
export const listSwarmTweetIdsInputSchema = z.object({
  author_twitter_username: z
    .string()
    .nullable()
    .optional()
    .describe("Filter by author's Twitter/X username (with or without '@', case-insensitive)"),
});
export const swarmTweetIdSchema = z.object({
  id: z.number().int().describe('The internal row ID of the tweet'),
  tweet_id: z.string().describe("The Tweet's 64-bit snowflake ID (as a decimal string)"),
});

// /api/predictions
export const insertPredictionInputSchema = z.object({
  context: z
    .string()
    .nullable()
    .optional()
    .describe(
      'Optional context for the post, e.g. if the tweet is a reply in a thread, this should contain the preceding tweets in the thread. Context could also be previous tweets by same author, or context from a wider debate in a subcommunity.',
    ),
  prediction: z.string().describe('The prediction contained in the tweet (must be extracted verbatim from the tweet text)'),
  task_id: z.number().int().nullable().optional().describe('The ID of the task that led to finding this prediction'),
  topic: z
    .string()
    .describe(
      'The topic of the prediction, can be empty (for now), but ideally should be descriptive on a high-level (e.g. politics, sports, entertainment, economy, tech, etc.)',
    ),
  tweet_id: z.string().describe('Database identifier of the tweet that contains the prediction (foreign key to tweets.id)'),
});
export const verificationClaimSchema = z.object({
  id: z.number().int(),
  inserted_at: z.string().describe('The timestamp when the verification claim was inserted'),
  inserted_by_address: z.string().describe('The wallet address of the agent who inserted the verification claim'),
  is_latest_for_agent: z.boolean().describe('True if this is the latest claim by this agent for this prediction'),
  outcome: predictionOutcomeSchema.describe('The outcome of the prediction verification process'),
  prediction_id: z.number().int().describe('The ID of the prediction that this verification claim is for'),
  proof: z
    .string()
    .describe(
      'The proof for the verification claim (markdown text containing data, links to sources, reasoning). If outcome is `MostlyTrue` or `Invalid`, the proof contains details about which parts of the prediction are true/false/invalid.',
    ),
});
export const setPredictionContextInputSchema = z.object({
  prediction_id: z.number(),
  context: z.string(),
});
export const predictionVerificationVerdictSchema = z.object({
  id: z.number().int(),
  inserted_at: z.string().describe('The timestamp when the verification verdict was inserted'),
  inserted_by_address: z.string().describe('The wallet address of the agent who inserted the verification verdict'),
  prediction_id: z.number().int().describe('The ID of the prediction that this verification verdict is for'),
  prediction_verification_claim_id: z
    .number()
    .int()
    .nullable()
    .describe(
      "The ID of the verification claim that this verdict most agrees with. If `null`, it means the verdict doesn't agree with any of the claims (evidence isn't clear enough to come to a verdict).",
    ),
  reasoning: z.string().describe('The reasoning for the verdict (markdown text)'),
});
export const insertPredictionOutputSchema = z.object({
  id: z.number().int(),
  context: z
    .string()
    .nullable()
    .describe('Optional context for the post, e.g. if the tweet is a reply in a thread, this contains the preceding tweets in the thread'),
  inserted_at: z.string().describe('The timestamp when the prediction was inserted'),
  inserted_by_address: z.string().describe('The wallet address of the agent who inserted the prediction'),
  prediction: z.string().describe('The prediction contained in the post (extracted verbatim from the post)'),
  topic: z.string().describe('The topic of the prediction'),
  tweet: swarmTweetSchema.describe('The tweet that contains this prediction'),
  verification_claims: z.array(verificationClaimSchema).describe('The verification claims for the prediction'),
  verification_verdict: predictionVerificationVerdictSchema
    .nullable()
    .describe('The verdict for the prediction, based on all its verification claims'),
});
export const listPredictionsInputSchema = paginationInputSchema.extend({
  search: z.string().nullable().optional().describe('Text search filter (case-insensitive, searches relevant content fields)'),
  sort_by: z.enum(['id', 'twitter_username']).nullable().optional().describe('Column to sort by'),
  sort_order: z.enum(['asc', 'desc']).nullable().optional().describe('Sort order by ID/insertion timestamp (default: Asc)'),
});

// /api/prediction-verification-claims
export const insertPredictionVerificationClaimInputSchema = z.object({
  outcome: predictionOutcomeSchema.describe('The outcome of the prediction verification process'),
  prediction_id: z.number().describe('The ID of the prediction that this verification claim is for'),
  proof: z
    .string()
    .describe(
      'The proof for the verification claim (markdown text containing data, links to sources, reasoning). If outcome is MostlyTrue or Unverifiable, the proof should contain details about which parts of the prediction are true/false/unverifiable.',
    ),
});

export const listPredictionVerificationClaimsInputSchema = paginationInputSchema.extend({
  sort_order: z.enum(['asc', 'desc']).nullable().optional().describe('Sort order by ID/insertion timestamp (default: Asc)'),
});

// /api/prediction-verification-verdicts
export const insertPredictionVerificationVerdictInputSchema = z.object({
  prediction_id: z.number(),
  prediction_verification_claim_id: z.number().nullable(),
  reasoning: z.string(),
});
export const listPredictionVerificationVerdictsInputSchema = paginationInputSchema;

// /api/tasks
export const listTasksInputSchema = paginationInputSchema.extend({
  sort_by_priority_desc: z.boolean(),
});
export const taskSchema = z.object({
  id: z.number().int(),
  inserted_at: z.string(),
  priority: z.number().int(),
  status: z.enum(['Pending', 'Claimed', 'Started', 'Completed']),
  task_type: z.enum(['FindAllPredictionsOfUser', 'FindAllPredictionsOfTopic']),
  value: z.string(),
  claimed_at: z.string().nullable(),
  completed_at: z.string().nullable(),
});
export const tasksSchema = z.array(taskSchema);
export const claimTaskInputSchema = z.object({
  task_id: z.number().int(),
});
export const insertTaskInputSchema = z.object({
  priority: z.number().int(),
  task_type: z.enum(['FindAllPredictionsOfUser', 'FindAllPredictionsOfTopic']),
  value: z.string(),
});

// TYPES

export type CreateChallengeOutput = z.infer<typeof createChallengeOutputSchema>;
export type VerifyChallengeOutput = z.infer<typeof verifyChallengeOutputSchema>;
export type InsertPredictionInput = z.infer<typeof insertPredictionInputSchema>;
export type VerificationClaim = z.infer<typeof verificationClaimSchema>;
export type VerificationVerdict = z.infer<typeof predictionVerificationVerdictSchema>;
export type ListPredictionVerificationVerdictsInput = z.infer<typeof listPredictionVerificationVerdictsInputSchema>;
export type InsertPredictionVerificationVerdictInput = z.infer<typeof insertPredictionVerificationVerdictInputSchema>;
export type SetPredictionContextInput = z.infer<typeof setPredictionContextInputSchema>;
export type InsertPredictionOutput = z.infer<typeof insertPredictionOutputSchema>;
export type PaginationInput = z.infer<typeof paginationInputSchema>;
export type ListPredictionsInput = z.infer<typeof listPredictionsInputSchema>;
export type InsertPredictionVerificationClaimInput = z.infer<typeof insertPredictionVerificationClaimInputSchema>;
export type ListPredictionVerificationClaimsInput = z.infer<typeof listPredictionVerificationClaimsInputSchema>;
export type AgentContributionStats = z.infer<typeof agentContributionStatsSchema>;
export type AgentContributionStatsOutput = z.infer<typeof agentContributionStatsOutputSchema>;
export const ContentType = contentTypeSchema.enum;
export type InsertContentScoreInput = z.infer<typeof insertContentScoreInputSchema>;
export type ContentScore = z.infer<typeof contentScoreSchema>;
export type LogoutAllOutput = z.infer<typeof logoutAllOutputSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type SwarmTask = z.infer<typeof taskSchema>;
export type ListTasksInput = z.infer<typeof listTasksInputSchema>;
export type ClaimTaskInput = z.infer<typeof claimTaskInputSchema>;
export type InsertTaskInput = z.infer<typeof insertTaskInputSchema>;
export type SwarmPermission = z.infer<typeof permissionSchema>;
export type InsertSwarmTweetInput = z.infer<typeof swarmTweetInputSchema>;
export type SwarmTweet = z.infer<typeof swarmTweetSchema>;
export type ListSwarmTweetsInput = z.infer<typeof listSwarmTweetsInputSchema>;
export type ListSwarmTweetIdsInput = z.infer<typeof listSwarmTweetIdsInputSchema>;
export type SwarmTweetId = z.infer<typeof swarmTweetIdSchema>;
