import { SS58Address } from '@torus-network/sdk/types';

export type AgentPublicConfig = {
  address: SS58Address;
  name: string;
  url: string;
  topLevel: boolean;
  contributionKey: string;
};

export const agentPublicConfigs: Record<string, AgentPublicConfig> = {
  'prediction-finder': {
    address: '5ExhSX83sbkorNwpBTZL3pBxX6PDMB2kKZjvwkMxpNKCP2Yh' as SS58Address,
    name: 'prediction-finder',
    url: process.env.PREDICTION_FINDER_BASE_URL || 'https://real-trump.fun/torus/prediction-finder',
    topLevel: true,
    contributionKey: 'num_predictions_submitted',
  },
  'prediction-detector': {
    address: '5GEUxJ9TpLQHfbaUAMx6RB4iJ2duLY7oswaXqn9rcEpAvWKQ' as SS58Address,
    name: 'prediction-detector',
    url: process.env.PREDICTION_DETECTOR_BASE_URL || 'https://real-trump.fun/torus/prediction-detector',
    topLevel: false,
    contributionKey: '',
  },
  'bot-detector': {
    address: '5FCKLnjXSR8Dwe6AS93tnGvnAmDsnNqivvfWcjjsFEBC4i4V' as SS58Address,
    name: 'bot-detector',
    url: process.env.BOT_DETECTOR_BASE_URL || 'https://real-trump.fun/torus/bot-detector',
    topLevel: false,
    contributionKey: '',
  },
  'prediction-verifier': {
    address: '5GKvHYoaKKr6jWYM7FiUY6i7JZsaUfXrCdfEhFL89BxnCTCB' as SS58Address,
    name: 'prediction-verifier',
    url: process.env.PREDICTION_VERIFIER_BASE_URL || 'https://real-trump.fun/torus/prediction-verifier',
    topLevel: true,
    contributionKey: 'num_verification_claims_submitted',
  },
  'openrouter-router': {
    address: '5EexhTdfBsLVE99HGS5mQEMj86FoejXHmhZstKajEX8CvotT' as SS58Address,
    name: 'openrouter-router',
    url: process.env.OPENROUTER_ROUTER_BASE_URL || 'https://real-trump.fun/torus/openrouter-router',
    topLevel: false,
    contributionKey: '',
  },
  'verdict-reasoning-agent': {
    address: '5HTkSenPbzHNHSajcczw9jdXmAAopZ95crVPKpHw1wi4qdY5' as SS58Address,
    name: 'verdict-reasoning-agent',
    url: process.env.VERDICT_REASONING_BASE_URL || 'https://real-trump.fun/torus/verdict-reasoning',
    topLevel: true,
    contributionKey: 'num_verification_verdicts_submitted',
  },
  'perplexity-bridge': {
    address: '5Dd8xNBAr4EkFTjgxovuvSimzFdZTH9gyn5Jn5DzC3HuXJFC' as SS58Address,
    name: 'perplexity-bridge',
    url: process.env.PERPLEXITY_BRIDGE_BASE_URL || 'https://real-trump.fun/torus/perplexity-bridge',
    topLevel: false,
    contributionKey: '',
  },
  'prediction-context-finder': {
    address: '5FhFGE4z1fnNas9izBjMrDK72qtFvFogcCe62SqZgKrBG2fT' as SS58Address,
    name: 'prediction-context-finder',
    url: process.env.PREDICTION_CONTEXT_FINDER_BASE_URL || 'https://real-trump.fun/torus/prediction-context-finder',
    topLevel: true,
    contributionKey: 'num_prediction_contexts_added',
  },
  'venice-bridge': {
    address: '5DJXHPBZjXvY8qYGRw6mnd4tDDUzsSp2TfWdwvvy96YgQQXD' as SS58Address,
    name: 'venice-bridge',
    url: process.env.VENICE_BRIDGE_BASE_URL || 'https://real-trump.fun/torus/venice-bridge',
    topLevel: false,
    contributionKey: '',
  },
  'english-classifier': {
    address: '5DwEqYekMJV9C1hU4hk16bzhtGHbvbkMxJK5rNVFsAu5NwAD' as SS58Address,
    name: 'english-classifier',
    url: process.env.ENGLISH_CLASSIFIER_BASE_URL || 'https://real-trump.fun/torus/english-classifier',
    topLevel: false,
    contributionKey: '',
  },
  'prediction-verifiability-checker': {
    address: '5FtHqr6o2w4Skv3RAcyAXhAiCwxsuEUaWUUkZF9WSPwUwa2U' as SS58Address,
    name: 'prediction-verifiability-checker',
    url: process.env.PREDICTION_VERIFIABILITY_CHECKER_BASE_URL || 'https://real-trump.fun/torus/prediction-verifiability-checker',
    topLevel: false,
    contributionKey: '',
  },
};
