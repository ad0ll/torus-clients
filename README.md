# @trump-fun/torus-clients

Open source clients for the Trump.fun Torus agents

# Installation

```bash
npm install @trump-fun/torus-clients
```

### prediction-detector

- **Purpose**:Lightweight LLM classifier step that tells you if the provided text, texts, or X posts contain a prediction to filter out irrelevant content
- **Address**: 5GEUxJ9TpLQHfbaUAMx6RB4iJ2duLY7oswaXqn9rcEpAvWKQ
- **URL**: https://real-trump.fun/torus/prediction-detector
- **Supported interfaces**: REST, Torus AgentServer
- **Notion**: [Here, has reference curls and reference AgentClient code](https://www.notion.so/prediction-detector-23390dd606c180f48ec5da3eb3398078)
- **Example usage**:

```ts
// Make sure to install "@trump-fun/torus-clients"

//I'll format this tomorrow

// Detect predictions in text
const response = await client.text({
  text,
  model, //openrouter, default is openai/gpt-4.1-mini
});

//Detect predictions in multiple texts at once
const response = await client.textBatch({
  texts,
  model, //openrouter, default is openai/gpt-4.1-mini
});

//Detect predictions in X posts
const response3 = await client.x({ postIds, model });
```

### author-scorer-and-bot-detector

- **Purpose**: Classification step that gives you a quality score for a given content creator and tells you the likelihood that the user is a bot
- **URL**: https://real-trump.fun/torus/bot-detector
- **Address**: 5FCKLnjXSR8Dwe6AS93tnGvnAmDsnNqivvfWcjjsFEBC4i4V
- **Supported interfaces**: REST, Torus AgentServer
- **Notion**: [Here, has reference curls and reference AgentClient code, TODO reference agent client code in Notion is outdated, see reference below, its current](https://www.notion.so/author-scorer-and-bot-detector-23390dd606c180f48ec5da3eb3398078)
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

### english-detector

- **Purpose**: Classification step that checks if the provided text is in english to save on LLM tokens
- **Address**: 5FCKLnjXSR8Dwe6AS93tnGvnAmDsnNqivvfWcjjsFEBC4i4V
- **URL**: https://real-trump.fun/torus/english-detector
- **Supported interfaces**: REST, Torus AgentServer
- **Notion**: [Here, has reference curls and reference AgentClient code](https://www.notion.so/english-detector-23390dd606c180a2ade7cf53bd4f631d)
- **Example usage**:

```ts
//TODO, english detector is in its own repo and I need to integrate it into my monorepo/framework.
// The AgentServer version isn't deployed yet, but the legacy REST API version is so its usable if you want to use it.
```

### the-great-image-interrogator

- **Purpose**: Performs common image analysis tasks such as OCR, label and object detection, celebrity recognition, and LLM captioning
- **Address**: 5HVXyScRKkC5hvJ3VhWmD1UGdy1YXgAHLTpR63XpA8YcNBaY
- **URL**: https://real-trump.fun/torus/image-analysis
- **Supported interfaces**: REST, MCP
- **Notion**: [Here, has reference curls and MCP examples and instructions](https://www.notion.so/the-great-image-interrogator-23390dd606c18076bbd4e93df0a23564). This one uniquely [also has Swagger docs here](https://real-trump.fun/image-analysis/)
- **Example usage**:

```ts
//TODO, image analysis is in its own repo and isn't using AgentServer and I need to integrate it into my monorepo/framework.

//The AgentServer version isn't deployed yet, but the legacy REST API version and MCP version is if you want to use it.
```

### prediction-verifier

- **Purpose**: Checks if a given prediction was correct or not after the fact
- **Address**: 5GKvHYoaKKr6jWYM7FiUY6i7JZsaUfXrCdfEhFL89BxnCTCB
- **URL**: https://real-trump.fun/torus/prediction-verifier
- **Supported interfaces**: AgentServer
- **Notion**: [Here, has reference curls and MCP examples and instructions](https://www.notion.so/prediction-verifier-23390dd606c1808f9d33fa66611c3c6f). TODO on linking to source code and schemas.
- **Example usage**:

```ts
// Make sure to install "@trump-fun/torus-clients"
import { PredictionVerifierClient } from '@trump-fun/torus-clients';

const verifierClient = new PredictionVerifierClient(mnemonic, 'https://real-trump.fun/torus/prediction-verifier');

// Fetch then verify a prediction from the swarm memory, then insert a claim into the swarm memory
const response = await verifierClient.verifySwarmPrediction({
  predictionId: 1,
});

// Verify a raw prediction, no impact on swarm memory
const response2 = await verifierClient.verifyRawPrediction({
  prediction: 'I predict BTC will be $100,000 by the end of the 2025',
});

// Note: The agent also has a "scheduled" method, but that's an intentionally private method for a scheduled job, so reference code has been omitted.
```

- **Note**: This is the agent as it was submitted to the Imperial Blockchain Hackathon this year. It's just a PoC and will undergo heavy changes in the coming few weeks.

### openrouter-router

- **Purpose**: Routes requests to a managed openrouter model
- **Address**: 5EexhTdfBsLVE99HGS5mQEMj86FoejXHmhZstKajEX8CvotT
- **URL**: https://real-trump.fun/torus/openrouter-router
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

### prediction-finder

- **Purpose**: Finds predictions on X and stores them in the swarm memory
- **Address**: 5ExhSX83sbkorNwpBTZL3pBxX6PDMB2kKZjvwkMxpNKCP2Yh
- **URL**: https://real-trump.fun/torus/prediction-finder
- **Supported interfaces**: AgentServer
- **Notion**: NO_NOTION_PAGE_YET
- **Example usage**:

```ts
// Make sure to install "@trump-fun/torus-clients"
import { PredictionFinderClient } from '@trump-fun/torus-clients';

// Provide an advanced search query for X and the agent will find predictions and store them in the swarm memory
const response = await client.findPredictionsOnDemand({
  query,
  platform: 'x',
});

// The other function, "scheduled" is run by a job that periodically scrapes X for predictions for the swarm, and isn't exposed to the public.
```

### verdict-reasoning

- **Purpose**: Analyzes a predictions verification claims and upserts a verdict to the swarm memory
- **Address**: 5HTkSenPbzHNHSajcczw9jdXmAAopZ95crVPKpHw1wi4qdY5
- **Remote address**: https://real-trump.fun/torus/verdict-reasoning
- **Supported interfaces**: AgentServer
- **Example usage**:

```ts
// Make sure to install "@trump-fun/torus-clients"
import { VerdictReasoningAgentClient } from '@trump-fun/torus-clients';

const client = new VerdictReasoningAgentClient(mnemonic, 'https://real-trump.fun/torus/verdict-reasoning');

//TODO, agent is deployed, but needs refinement and testing, expected to go public 07/23/2025 - 07/24/2025
```

###  perplexity-bridge
- **Purpose**: Make requests against the Perplexity API from the Swarm
- **Address**: 5Dd8xNBAr4EkFTjgxovuvSimzFdZTH9gyn5Jn5DzC3HuXJFC
- **URL**: https://real-trump.fun/torus/perplexity-bridge
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