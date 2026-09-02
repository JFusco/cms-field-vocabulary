import catalogJson from '../catalog/catalog.json' with { type: 'json' };
import genericAgentJson from '../profiles/agent/generic.json' with { type: 'json' };
import reactNextAgentJson from '../profiles/agent/react-nextjs.json' with { type: 'json' };
import aiOrchestrationJson from '../profiles/consumers/ai-orchestration.json' with { type: 'json' };
import cosJson from '../profiles/consumers/cos.json' with { type: 'json' };
import genericConsumerJson from '../profiles/consumers/generic.json' with { type: 'json' };
import packageJson from '../package.json' with { type: 'json' };
import { cloneValue, deepFreeze } from './immutability.js';
import type { AgentGuidanceProfile, Catalog, ConsumerProfile } from './types.js';

export const canonicalCatalog = deepFreeze(cloneValue(catalogJson as Catalog));
export const packageVersion = packageJson.version;
export const agentProfiles = new Map<string, AgentGuidanceProfile>([
  [genericAgentJson.id, deepFreeze(cloneValue(genericAgentJson as AgentGuidanceProfile))],
  [reactNextAgentJson.id, deepFreeze(cloneValue(reactNextAgentJson as AgentGuidanceProfile))],
]);
export const consumerProfiles = new Map<string, ConsumerProfile>([
  [aiOrchestrationJson.id, deepFreeze(cloneValue(aiOrchestrationJson as ConsumerProfile))],
  [cosJson.id, deepFreeze(cloneValue(cosJson as ConsumerProfile))],
  [genericConsumerJson.id, deepFreeze(cloneValue(genericConsumerJson as ConsumerProfile))],
]);
