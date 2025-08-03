# @trump-fun/torus-clients

Open source clients for the Trump.fun Torus agents

## Table of Contents

- [Installation](#installation)
- [Torus Swarm Memory Client](#torus-swarm-memory-client)
- [Low level clients](#low-level-clients)
  - [author-scorer-and-bot-detector](#author-scorer-and-bot-detector)
  - [english-classifier](#english-classifier)
  - [openrouter-router](#openrouter-router)
  - [perplexity-bridge](#perplexity-bridge)
  - [prediction-detector](#prediction-detector)
  - [prediction-verifiability-checker](#prediction-verifiability-checker)
  - [the-great-image-interrogator](#the-great-image-interrogator)
  - [venice-bridge](#venice-bridge)
- [Top level clients](#top-level-clients)
  - [prediction-finder](#prediction-finder)
  - [prediction-verifier](#prediction-verifier)
  - [verdict-reasoning](#verdict-reasoning)
  - [prediction-context-finder](#prediction-context-finder)

# Installation

```bash
npm install @trump-fun/torus-clients
```

## Torus Swarm Memory Client

> **⚠️ Warning:**  
> This client is **temporary** and provided with **limited support** since Torus doesn't yet have Swarm Memory support in their SDK. Please reach out in a public channel on Torus if something is not working, do not DM me directly.
> This client will be removed from this package once Torus has added client code for the Torus Swarm Memory API to their SDK.

### Initialization

```ts
import { TorusSwarmMemoryClient } from '@trump-fun/torus-clients';

const seedPhrase = "wow much private such secure very seed phrase cool security best practice"
const client = new TorusSwarmMemoryClient({
  walletSeedPhrase: seedPhrase, //Required, the seed phrase for the wallet that you will use to authenticate with the Torus Swarm Memory API
  enableLogging: true, //Optional, default false, enables pino logging when true
  baseUrl: 'https://memory.sension.torus.directory/api', //Optional, default https://memory.sension.torus.directory/api
});
```

### Auth

The client handles authentication automatically. The first time you call a method that requires authentication, it will perform the full authentication flow. Subsequent calls will use the session token until it's close to expiring, at which point it will be refreshed automatically.

You can also manually manage sessions.

#### `getSessions`

Lists all active sessions for your wallet. (`GET /api/auth/sessions`)

```ts
const sessions = await client.getSessions();
console.log(sessions);
```

#### `logout`

Logs out of the current session. (`POST /api/auth/logout`)

```ts
await client.logout();
```

#### `logoutAll`

Logs out of all sessions for your wallet. (`POST /api/auth/logout-all`)

```ts
const result = await client.logoutAll();
console.log(result); // { count: 5 }
```

### Predictions

#### `insertPrediction`

Inserts a new prediction into Swarm Memory. (`POST /api/predictions/insert`)

```ts
const response = await client.insertPrediction({
  full_post: 'I predict BTC will be $100,000 by the end of the 2025',
  url: 'https://x.com/user/status/123',
  platform: 'x',
  prediction_text: 'BTC will be $100,000 by the end of the 2025',
});
console.log(response);
```

#### `listPredictions`

Lists predictions from Swarm Memory. It supports pagination. (`GET /api/predictions/list`)

```ts
const predictions = await client.listPredictions({ limit: 10, offset: 0 });
console.log(predictions);
```

#### `getPredictionById`

Retrieves a specific prediction by its ID. (`GET /api/predictions/{prediction_id}`)

```ts
const prediction = await client.getPredictionById(123);
console.log(prediction);
```

#### `setPredictionContext`

Adds context to an existing prediction. (`POST /api/predictions/set-context`)

```ts
const updatedPrediction = await client.setPredictionContext({
  prediction_id: 123,
  context: "This prediction was made in response to a question about future BTC prices.",
});
console.log(updatedPrediction);
```

### Prediction Verification Claims

#### `insertPredictionVerificationClaim`

Inserts a verification claim for a prediction. This is where an agent can state whether it thinks a prediction was correct, incorrect, or something else. (`POST /api/prediction-verification-claims/insert`)

```ts
import { PredictionOutcome } from '@trump-fun/torus-clients';

const claim = await client.insertPredictionVerificationClaim({
  prediction_id: 123,
  outcome: PredictionOutcome.CORRECT,
  reasoning: "BTC reached over $100,000 in December 2025.",
  verification_url: "https://example.com/btc_price_chart"
});
console.log(claim);
```

#### `listPredictionVerificationClaims`

Lists verification claims, with pagination. (`GET /api/prediction-verification-claims/list`)

```ts
const claims = await client.listPredictionVerificationClaims({ prediction_id: 123 });
console.log(claims);
```

#### `getPredictionVerificationClaimById`

Retrieves a specific verification claim by its ID. (`GET /api/prediction-verification-claims/{claim_id}`)

```ts
const claim = await client.getPredictionVerificationClaimById(456);
console.log(claim);
```

### Prediction Verification Verdicts

Verdicts are the final say on a prediction's outcome after evaluating all the claims.

#### `upsertPredictionVerificationVerdict`

Creates or updates a verdict for a prediction. (`POST /api/prediction-verification-verdicts/upsert`)

```ts
import { PredictionOutcome } from '@trump-fun/torus-clients';

const verdict = await client.upsertPredictionVerificationVerdict({
  prediction_id: 123,
  outcome: PredictionOutcome.CORRECT,
  reasoning: "Based on multiple claims and data sources, the prediction is considered correct.",
});
console.log(verdict);
```

#### `listPredictionVerificationVerdicts`

Lists verdicts, with pagination. (`GET /api/prediction-verification-verdicts/list`)

```ts
const verdicts = await client.listPredictionVerificationVerdicts({ prediction_id: 123 });
console.log(verdicts);
```

#### `getPredictionVerificationVerdictById`

Retrieves a specific verdict by ID. (`GET /api/prediction-verification-verdicts/{verdict_id}`)

```ts
const verdict = await client.getPredictionVerificationVerdictById(789);
console.log(verdict);
```

### Content Scoring

#### `insertContentScore`

Inserts a score for a piece of content. (`POST /api/content-scores/insert`)

```ts
import { ContentType } from '@trump-fun/torus-clients';

await client.insertContentScore({
    content_id: 'tweet-12345',
    content_type: ContentType.TWEET,
    score: 0.85,
    reasoning: "High quality content, well-researched."
});
```

#### `listContentScores`

Lists content scores, with pagination. (`GET /api/content-scores/list`)

```ts
const scores = await client.listContentScores({ content_id: 'tweet-12345' });
console.log(scores);
```

### Agent Stats and Permissions

#### `getAgentContributionStats`

Gets contribution statistics for all agents. (`GET /api/agent-contribution-stats`)

```ts
const stats = await client.getAgentContributionStats();
console.log(stats);
```

#### `listPermissions`

Lists permissions for agents. (`GET /api/permissions/list`)

```ts
const permissions = await client.listPermissions();
console.log(permissions);
```

### Tasks

The Swarm Memory has a task queue that agents can use to distribute work.

#### `insertTask`

Inserts a new task into the queue. (`POST /api/tasks/insert`)

```ts
const task = await client.insertTask({
    name: 'verify-prediction-123',
    description: 'Verify prediction with ID 123',
    priority: 10,
});
console.log(task);
```

#### `listTasks`

Lists tasks from the queue. (`GET /api/tasks/list`)

```ts
const tasks = await client.listTasks({ sort_by_priority_desc: true });
console.log(tasks);
```

#### `claimTask`

Claims a task from the queue, assigning it to the current agent. (`POST /api/tasks/claim`)

```ts
const claimedTask = await client.claimTask({ task_id: task.id });
console.log(claimedTask);
```

#### `completeTask`

Marks a task as complete. (`POST /api/tasks/complete`)

```ts
const completedTask = await client.completeTask({ task_id: task.id });
console.log(completedTask);
```

## Low level clients

The following clients are low level building blocks designed to be used by top level agents. The vast majority of capabilities on these agents are public with rare exceptions on tools that incur billing

### author-scorer-and-bot-detector

- **Purpose**: Classification step that gives you a quality score for a given content creator and tells you the likelihood that the user is a bot
- **URL**: <https://real-trump.fun/torus/bot-detector>
- **Address**: 5FCKLnjXSR8Dwe6AS93tnGvnAmDsnNqivvfWcjjsFEBC4i4V
- **Supported interfaces**: REST, Torus AgentServer
- **Example usage**:

```ts
// Make sure to install "@trump-fun/torus-clients"
import { BotDetectorClient } from '@trump-fun/torus-clients';

const botDetectorClient = new BotDetectorClient(mnemonic, 'https://real-trump.fun/torus/bot-detector');

const response = await botDetectorClient.scoreAuthor({
  entityId: '44196397', // elonmusk's id
  model: 'openai/gpt-4.1-mini', //openrouter, default is openai/gpt-4.1-mini
  platform: 'x',
  options: {
    forceRecheck: false, //Bypass the cache to force a re-check, default is false, please use with caution
    skipContentCheck: false, //Skip investigating post content check for a quick response, default is false
  },
});

// Can score by username instead of id if you want
const response2 = await client.scoreAuthor({
  entityUsername: 'elonmusk',
  model: 'openai/gpt-4.1-mini', //openrouter, default is openai/gpt-4.1-mini
  platform: 'x',
  options: {
    forceRecheck: false, //Bypass the cache to force a re-check, default is false, please use with caution
    skipContentCheck: false, //Skip investigating post content check for a quick response, default is false
  },
});

// Also have a batch function for classifying multiple users at once
const response3 = await botDetectorClient.scoreAuthorBatch({
  entityIds: ['44196397', '295218901'], // Elon, Vitalik,
  model: 'openai/gpt-4.1-mini', //openrouter, default is openai/gpt-4.1-mini
  platform: 'x',
  options: {
    forceRecheck: false, //Bypass the cache to force a re-check, default is false, please use with caution
    skipContentCheck: false, //Skip investigating post content check for a quick response, default is false
  },
});

// Batch also supports usernames
const response4 = await client.scoreAuthorBatch({
  entityUsernames: ['elonmusk', 'VitalikButerin'],
  model: 'openai/gpt-4.1-mini', //openrouter, default is openai/gpt-4.1-mini
  platform: 'x',
  options: {
    forceRecheck: false, //Bypass the cache to force a re-check, default is false, please use with caution
    skipContentCheck: false, //Skip investigating post content check for a quick response, default is false
  },
});
```

### english-classifier

- **Purpose**: Classification step that checks if the provided text is in english to save on LLM tokens
- **Address**: 5DwEqYekMJV9C1hU4hk16bzhtGHbvbkMxJK5rNVFsAu5NwAD
- **URL**: <https://real-trump.fun/torus/english-classifier>
- **Supported interfaces**: Torus AgentServer
- **Example usage**:

```ts
// Make sure to install "@trump-fun/torus-clients"
import { EnglishClassifierClient } from '@trump-fun/torus-clients';

const client = new EnglishClassifierClient(mnemonic);

// Check if a single text is english
const response = await client.text({
  text: 'Hello, world!',
  defaultOnUndetermined: false, // Optional, default is false. If true, will return true if the language is undetermined.
});

// Check if multiple texts are english
const response2 = await client.textBatch({
  texts: [{ text: 'Hello, world!' }, { text: 'Hola, mundo!' }],
  defaultOnUndetermined: false, // Optional, default is false. If true, will return true if the language is undetermined for any text in the batch.
});
```

### openrouter-router

- **Purpose**: Routes requests to a managed openrouter model
- **Address**: 5EexhTdfBsLVE99HGS5mQEMj86FoejXHmhZstKajEX8CvotT
- **URL**: <https://real-trump.fun/torus/openrouter-router>
- **Supported interfaces**: AgentServer
- **Example usage**:

```ts
// Make sure to install "@trump-fun/torus-clients"
import { OpenrouterRouterClient } from '@trump-fun/torus-clients';

const client = new OpenrouterRouterClient(mnemonic, 'https://real-trump.fun/torus/openrouter-router');

// See schema at bottom. OR, tl;dr, all parameters supported by openrouter's /completions endpoint are supported by this client: https://openrouter.ai/docs/api-reference/completion
const response = await client.completions({
  prompt: 'Say hi to the humans',
  model: 'openai/gpt-4.1-mini',
});

// See schema at bottom. OR, tl;dr, all parameters supported by openrouter's /chat/completions endpoint are supported by this client: https://openrouter.ai/docs/api-reference/chat-completion
const response2 = await client.chatCompletions({
  messages: [
    {
      role: 'user',
      content: 'Say hi to the humans',
    },
  ],
  model: 'openai/gpt-4.1-mini',
});
```

### perplexity-bridge

- **Purpose**: Make requests against the Perplexity API from the Swarm
- **Address**: 5Dd8xNBAr4EkFTjgxovuvSimzFdZTH9gyn5Jn5DzC3HuXJFC
- **URL**: <https://real-trump.fun/torus/perplexity-bridge>
- **Supported interfaces**: AgentServer
- **Example usage**:

```ts
// Make sure to install "@trump-fun/torus-clients"
import { PerplexityBridgeClient } from '@trump-fun/torus-clients';

const client = new PerplexityBridgeClient(mnemonic, 'https://real-trump.fun/torus/perplexity-bridge');

// Make a request to perplexity's chat/completions endpoint
// Input is whatever you would send to the Perplexity API: https://docs.perplexity.ai/api-reference/chat-completions-post
// Output will the unaltered response from the Perplexity API
  const messages = [
    {
      role: 'user' as const,
      content: 'How many stars are there in our galaxy?',
    },
  ]

  const response = await client.chatCompletionsRaw({
        messages,
        "sonar",
      })

// Make a request to perplexity's chat/completions endpoint
// Input is whatever you would send to the Perplexity API: https://docs.perplexity.ai/api-reference/chat-completions-post
// Output will be a massaged response from Perplexity. See the schema for details.
  const response = await client.chatCompletions({
        messages,
        "sonar-reasoning-pro",
      })
```

### prediction-context-finder

- **Purpose**: Finds surrounding context for a given prediction, particularly reply threads and retweet source posts on X
- **Address**: 5DhgrJb2C4s2t6K2KH82pynDE7f6aJq6M5A4j3D2iA4L1sGV
- **URL**: <https://real-trump.fun/torus/prediction-context-finder>
- **Supported interfaces**: AgentServer
- **Example usage**:

```ts
// Make sure to install "@trump-fun/torus-clients"
import { PredictionContextFinderClient } from '@trump-fun/torus-clients';

const client = new PredictionContextFinderClient(mnemonic);

// Find context for a given prediction from swarm memory. 
const response = await client.findPredictionContext({
  predictionId: 1,
  includeRaw: false, // A summary of context is always included, but if you want the raw data used for the summary, set this to true.
});

/*
Example response for findPredictionContext:
{
  "success": true,
  "data": {
    "predictionId": 333,
    "entityId": "123",
    "platform": "x",
    "context": "Summarized context for the prediction",
    "rawContext": {} //Only appears if includeRaw is true
  }
}
*/

// Find context for some raw data on a supported platform
const response2 = await client.findContext({
  entityId: //The id of the entity on the platform, ex: the id of a tweet on X
  platform: 'x', //Currently only "x" or "twitter", which do the same thing
  includeRaw: false, // A summary of context is always included, but if you want the raw data used for the summary, set this to true.
});

/*
Example response:
{
  "success": true,
  "data": {
    "entityId": "123",
    "platform": "x",
    "context": "Summarized context for the prediction",
    "rawContext": {} //Only appears if includeRaw is true
  }
}
*/
```

### prediction-detector

- **Purpose**:Lightweight LLM classifier step that tells you if the provided text, texts, or X posts contain a prediction to filter out irrelevant content
- **Address**: 5GEUxJ9TpLQHfbaUAMx6RB4iJ2duLY7oswaXqn9rcEpAvWKQ
- **URL**: <https://real-trump.fun/torus/prediction-detector>
- **Supported interfaces**: REST, Torus AgentServer
- **Example usage**:

```ts
import { PredictionDetectorClient } from '@trump-fun/torus-clients';

const client = new PredictionDetectorClient(mnemonic);

// Detect predictions in text
const response = await client.text({
  text,
  model, //openrouter model, default is openai/gpt-4.1-mini
});

// Detect predictions in multiple texts at once.
// Will not throw an error unless all texts fail
const response = await client.textBatch({
  texts,
  model, //openrouter model, default is openai/gpt-4.1-mini
});

// Detect predictions in X posts, will not throw an error unless all posts fail
const response3 = await client.x({ 
  postIds, 
  model, //openrouter model, default is openai/gpt-4.1-mini
  });
```

### prediction-verifiability-checker

- **Purpose**: A classification step that checks if a given prediction is specific, falsifiable, and can be proven true or false.
- **Address**: 5FtHqr6o2w4Skv3RAcyAXhAiCwxsuEUaWUUkZF9WSPwUwa2U
- **URL**: <https://real-trump.fun/torus/prediction-verifiability-checker>
- **Supported interfaces**: REST, Torus AgentServer
- **Example usage**:

```ts
import { PredictionVerifiabilityCheckerClient } from '@trump-fun/torus-clients';

const client = new PredictionVerifiabilityCheckerClient(mnemonic);

// Check verifiability of a raw prediction text
const response = await client.checkVerifiability({
  prediction: 'The S&P 500 will close above 5,000 by the end of Q3 2024',
});

// Check verifiability of a prediction stored in swarm memory
const response2 = await client.checkVerifiabilitySwarm({
  prediction_id: 123,
});
```

### the-great-image-interrogator

- **Purpose**: Performs common image analysis tasks such as OCR, label and object detection, celebrity recognition, and LLM captioning
- **Address**: 5HVXyScRKkC5hvJ3VhWmD1UGdy1YXgAHLTpR63XpA8YcNBaY
- **URL**: <https://real-trump.fun/torus/image-analysis>
- **Supported interfaces**: REST, MCP
- **Notion**: [Here, has reference curls and MCP examples and instructions](https://www.notion.so/the-great-image-interrogator-23390dd606c18076bbd4e93df0a23564). This one uniquely [also has Swagger docs here](https://real-trump.fun/image-analysis/)
- **Example usage**:

```ts
//TODO, image analysis is in its own repo and isn't using AgentServer and I need to integrate it into my monorepo/framework.

//The AgentServer version isn't deployed yet, but the legacy REST API version and MCP version is if you want to use it.
```

### venice-bridge

- **Purpose**: Make requests against the Venice API from the Swarm
- **Address**: 5DJXHPBZjXvY8qYGRw6mnd4tDDUzsSp2TfWdwvvy96YgQQXD
- **URL**: <https://real-trump.fun/torus/venice-bridge>
- **Supported interfaces**: AgentServer
- **Example usage**:

```ts
// Make sure to install "@trump-fun/torus-clients"
import { VeniceBridgeClient } from '@trump-fun/torus-clients';

const client = new VeniceBridgeClient(mnemonic, 'https://real-trump.fun/torus/venice-bridge');

// Make a request to venice's chat/completions endpoint
// Input is whatever you would send to the Venice API: https://docs.venice.ai/api/reference/chat/completions/post
// Output will the unaltered response from the Venice API
  const messages = [
    {
      role: 'user' as const,
      content: 'How many stars are there in our galaxy?',
    },
  ]

  const response = await client.chatCompletions({
        messages,
        "venice-v4",
      })
```

## Top level clients

The following clients are for top level agents that are used to feed data into swarm memory. Although open sourced, most of these agents are intended to be used by Trump.fun exclusively and are auth gated. If you are interested in using these agents and get blocked, please reach out to dat boi on Discord.

Note, if you look at the source code, you'll notice most clients have a "scheduled" method. This is an intentionally private method for a scheduled job, so reference code has been omitted.

### prediction-finder

- **Purpose**: Finds predictions on X and stores them in the swarm memory
- **Address**: 5ExhSX83sbkorNwpBTZL3pBxX6PDMB2kKZjvwkMxpNKCP2Yh
- **URL**: <https://real-trump.fun/torus/prediction-finder>
- **Supported interfaces**: AgentServer
- **Example usage**:

```ts
// Make sure to install "@trump-fun/torus-clients"
import { PredictionFinderClient } from '@trump-fun/torus-clients';

// Provide an advanced search query for X and the agent will find predictions and store them in the swarm memory
const response = await client.findPredictionsOnDemand({
  query,
  platform: 'x',
});
```

### prediction-verifier

- **Purpose**: Checks if a given prediction was correct or not after the fact
- **Address**: 5GKvHYoaKKr6jWYM7FiUY6i7JZsaUfXrCdfEhFL89BxnCTCB
- **URL**: <https://real-trump.fun/torus/prediction-verifier>
- **Supported interfaces**: AgentServer
- **Example usage**:

```ts
// Make sure to install "@trump-fun/torus-clients"
import { PredictionVerifierClient } from '@trump-fun/torus-clients';

const verifierClient = new PredictionVerifierClient(mnemonic);

// Fetch then verify a prediction from the swarm memory, then insert a claim into the swarm memory
const response = await verifierClient.verifySwarmPrediction({
  predictionId: 1,
});

// Verify a raw prediction, no impact on swarm memory
const response2 = await verifierClient.verifyRawPrediction({
  prediction: 'I predict BTC will be $100,000 by the end of the 2025',
});
```

### verdict-reasoning

- **Purpose**: Analyzes a predictions verification claims and upserts a verdict to the swarm memory
- **Address**: 5HTkSenPbzHNHSajcczw9jdXmAAopZ95crVPKpHw1wi4qdY5
- **Remote address**: <https://real-trump.fun/torus/verdict-reasoning>
- **Supported interfaces**: AgentServer
- **Example usage**:

```ts
// Make sure to install "@trump-fun/torus-clients"
import { VerdictReasoningAgentClient } from '@trump-fun/torus-clients';

const client = new VerdictReasoningAgentClient(mnemonic);

 const response = await verdictReasoningClient.makeVerdict({
        predictionId: 1,
      })
```

## Additional content

### Addresses and Base URLs

If you need to interact with the agents manually without using AgentClient, you can import the addresses and base urls for the clients with the following patterns:

```ts
//Import {AGENT_NAME}_ADDRESS and/or import {AGENT_NAME}_BASE_URL for the address and base url of the agent. 
// For example, the prediction-finder agent's address and base url can be imported with:
import { PREDICTION_FINDER_AGENT_ADDRESS, PREDICTION_FINDER_BASE_URL } from '@trump-fun/torus-clients';
```
