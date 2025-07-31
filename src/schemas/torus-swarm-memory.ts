import { z } from 'zod';

// Schemas that are not bound to a specific endpoint
export enum PredictionOutcome {
  NotMatured = 'NotMatured',
  MaturedTrue = 'MaturedTrue',
  MaturedFalse = 'MaturedFalse',
  MaturedMostlyTrue = 'MaturedMostlyTrue',
  Unverifiable = 'Unverifiable',
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

// /api/predictions
export const insertPredictionInputSchema = z.object({
  full_post: z.string().describe('The full text of the post containing the prediction'),
  prediction: z
    .string()
    .describe('The prediction contained in the post (must be extracted verbatim from the post, i.e. a substring of full_post)'),
  prediction_timestamp: z.string().describe('The timestamp when the prediction was made (in RFC3339 format)'),
  predictor_twitter_user_id: z
    .string()
    .nullable()
    .describe('User ID of the user who made the prediction (stays the same when username changes), optional (provide if available)'),
  predictor_twitter_username: z.string().describe('The Twitter username of the user who made the prediction'),
  task_id: z.number().nullable().describe('The ID of the task that led to finding this prediction'),
  topic: z
    .string()
    .describe(
      'The topic of the prediction, can be empty (for now), but ideally should be descriptive on a high-level (e.g. politics, sports, entertainment, economy, tech, etc.)',
    ),
  url: z.string().url().describe('The URL of the prediction'),
});
export const verificationClaimSchema = z.object({
  id: z.number(),
  inserted_at: z.string().describe('The timestamp when the verification claim was inserted'),
  inserted_by_address: z.string().describe('The wallet address of the agent who inserted the verification claim'),
  outcome: predictionOutcomeSchema.describe('The outcome of the prediction verification process'),
  prediction_id: z.number().describe('The ID of the prediction that this verification claim is for'),
  proof: z
    .string()
    .describe(
      'The proof for the verification claim (markdown text containing data, links to sources, reasoning). If outcome is `MostlyTrue` or `Unverifiable`, the proof contains details about which parts of the prediction are true/false/unverifiable.',
    ),
});
export const setPredictionContextInputSchema = z.object({
  prediction_id: z.number(),
  context: z.string(),
});
export const predictionVerificationVerdictSchema = z.object({
  id: z.number().int(),
  inserted_at: z.string(),
  inserted_by_address: z.string(),
  prediction_id: z.number().int(),
  prediction_verification_claim_id: z.number().int(),
  reasoning: z.string(),
  verdict: z.boolean(),
});
export const insertPredictionOutputSchema = z.object({
  id: z.number(),
  context: z.string().nullable().describe('The context of the prediction, if it exists.'),
  full_post: z.string().describe('The full text of the post containing the prediction'),
  inserted_at: z.string().describe('The timestamp when the prediction was inserted'),
  inserted_by_address: z.string().describe('The wallet address of the agent who inserted the prediction'),
  prediction: z.string().describe('The prediction contained in the post (extracted verbatim from the post)'),
  prediction_timestamp: z.string().describe('The timestamp when the prediction was made (in RFC3339 format)'),
  predictor_twitter_user_id: z.string().nullable().describe('The Twitter ID of the user who made the prediction'),
  predictor_twitter_username: z.string().describe("The Twitter username of the agent who made the prediction (without '@')"),
  topic: z.string().describe('The topic of the prediction'),
  url: z.string().url().describe('The URL of the post containing the prediction'),
  verification_claims: z.array(verificationClaimSchema).describe('The verification claims for the prediction'),
  verification_verdict: predictionVerificationVerdictSchema.nullable(),
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

// /api/prediction-verification-verdicts
export const insertPredictionVerificationVerdictInputSchema = z.object({
  prediction_id: z.number(),
  prediction_verification_claim_id: z.number(),
  reasoning: z.string(),
  verdict: z.boolean(),
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
export type InsertPredictionVerificationClaimInput = z.infer<typeof insertPredictionVerificationClaimInputSchema>;
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
