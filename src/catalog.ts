import { agentProfiles, canonicalCatalog } from './data.js';
import { RENDERING_SELECTION_DISCRIMINATORS } from './definitions.js';
import { cloneValue, deepFreeze } from './immutability.js';
import type {
  CmsProfile,
  CompactRenderingOperation,
  DeepReadonly,
  FieldTypeFact,
  OfficialDataProjection,
  ResolveFieldContractsInput,
  ResolvedFieldContract,
  SelectedContract,
} from './types.js';

const profiles = new Map(canonicalCatalog.profiles.map((profile) => [profile.id, profile]));
const fields = new Map<string, { profile: CmsProfile; field: FieldTypeFact }>();
for (const profile of canonicalCatalog.profiles) {
  for (const field of profile.fields) fields.set(field.canonicalId, { profile, field });
}

export const catalog: DeepReadonly<import('./types.js').Catalog> = deepFreeze(cloneValue(canonicalCatalog));

function getCanonicalProfile(profileId: string): CmsProfile {
  const profile = profiles.get(profileId);
  if (!profile) throw new Error(`Unknown CMS vocabulary profile: ${profileId}`);
  return profile;
}

function getCanonicalField(profileId: string, fieldId: string): FieldTypeFact {
  const profile = getCanonicalProfile(profileId);
  const field = profile.fields.find((candidate) => candidate.canonicalId === fieldId);
  if (!field) throw new Error(`Field ${fieldId} does not belong to profile ${profileId}`);
  return field;
}

export function getProfile(profileId: string): CmsProfile {
  return cloneValue(getCanonicalProfile(profileId));
}

export function getFieldFact(profileId: string, fieldId: string): FieldTypeFact {
  return cloneValue(getCanonicalField(profileId, fieldId));
}

export function listFieldFacts(profileId: string): FieldTypeFact[] {
  return cloneValue(getCanonicalProfile(profileId).fields);
}

export function findFieldFact(fieldId: string): { profile: CmsProfile; field: FieldTypeFact } {
  const match = fields.get(fieldId);
  if (!match) throw new Error(`Unknown CMS field ID: ${fieldId}`);
  return { profile: cloneValue(match.profile), field: cloneValue(match.field) };
}

function compactOperation(operation: import('./types.js').RenderingOperation): CompactRenderingOperation {
  const { evidence: _evidence, claimRefs: _claimRefs, ...compact } = cloneValue(operation);
  return compact;
}

function indexRenderingSelections(input: ResolveFieldContractsInput): Map<string, Map<string, string>> {
  const requested = new Set(input.fieldIds);
  const indexed = new Map<string, Map<string, string>>();
  for (const selection of input.renderingSelections || []) {
    if (!requested.has(selection.fieldId)) {
      throw new Error(`Rendering selection references unrequested field: ${selection.fieldId}`);
    }
    if (!Object.hasOwn(RENDERING_SELECTION_DISCRIMINATORS, selection.discriminator)) {
      throw new Error(`Unknown rendering selection discriminator: ${selection.discriminator}`);
    }
    const allowed = (RENDERING_SELECTION_DISCRIMINATORS as Readonly<Record<string, readonly string[]>>)[selection.discriminator];
    if (!allowed) throw new Error(`Unknown rendering selection discriminator: ${selection.discriminator}`);
    if (!allowed.includes(selection.value)) {
      throw new Error(`Unknown ${selection.discriminator} selection value: ${selection.value}`);
    }
    const fieldSelections = indexed.get(selection.fieldId) || new Map<string, string>();
    if (fieldSelections.has(selection.discriminator)) {
      throw new Error(`Duplicate ${selection.discriminator} selection for ${selection.fieldId}`);
    }
    fieldSelections.set(selection.discriminator, selection.value);
    indexed.set(selection.fieldId, fieldSelections);
  }
  return indexed;
}

function resolveFieldContractsInternal(
  input: ResolveFieldContractsInput,
  allowUnresolvedRenderingSelections: boolean,
): SelectedContract | null {
  if (input.fieldIds.length === 0) {
    if ((input.renderingSelections?.length || 0) > 0) {
      throw new Error('Rendering selections require at least one requested field');
    }
    return null;
  }
  const profile = getCanonicalProfile(input.profileId);
  const agent = agentProfiles.get(input.agentProfile);
  if (!agent) throw new Error(`Unknown coding-agent profile: ${input.agentProfile}`);
  const renderingSelections = indexRenderingSelections(input);
  const requested = [...new Set(input.fieldIds)].sort();
  const contracts: ResolvedFieldContract[] = requested.map((fieldId) => {
    const field = getCanonicalField(profile.id, fieldId);
    const policyOperations = agent.rules
      .filter((rule) => rule.fieldId === fieldId)
      .flatMap((rule) => rule.operations);
    const allOperations = [...field.renderingOperations, ...policyOperations];
    const fieldSelections = renderingSelections.get(fieldId);
    const alternatives = new Map<string, Set<string>>();
    for (const operation of allOperations) {
      if (!operation.selection) continue;
      const values = alternatives.get(operation.selection.discriminator) || new Set<string>();
      values.add(operation.selection.equals);
      alternatives.set(operation.selection.discriminator, values);
    }
    if (!allowUnresolvedRenderingSelections) {
      for (const [discriminator, values] of alternatives) {
        if (values.size > 1 && !fieldSelections?.has(discriminator)) {
          throw new Error(
            `${fieldId} requires an explicit ${discriminator} rendering selection; expected one of: ${[...values].sort().join(', ')}`,
          );
        }
      }
    }
    for (const discriminator of fieldSelections?.keys() || []) {
      if (!allOperations.some((operation) => operation.selection?.discriminator === discriminator)) {
        throw new Error(`Rendering selection ${discriminator} does not apply to ${fieldId}`);
      }
      const selectedValue = fieldSelections?.get(discriminator);
      if (!allOperations.some((operation) => (
        operation.selection?.discriminator === discriminator && operation.selection.equals === selectedValue
      ))) {
        throw new Error(`${fieldId} does not support ${discriminator}=${selectedValue}`);
      }
    }
    const operations = allOperations
      .filter((operation) => {
        if (!operation.selection) return true;
        const selectedValue = fieldSelections?.get(operation.selection.discriminator);
        return selectedValue === undefined || selectedValue === operation.selection.equals;
      })
      .map(compactOperation)
      .sort((left, right) => left.id.localeCompare(right.id));
    return {
      canonicalId: field.canonicalId,
      nativeToken: field.nativeToken,
      valueShape: cloneValue(field.claims.valueShape.value),
      formats: field.formats.map(({ nativeToken, requires }) => ({
        nativeToken,
        ...(requires ? { requires: [...requires] } : {}),
      })),
      operations,
    };
  });
  const rendererIds = new Set(contracts.flatMap((contract) => contract.operations.map((operation) => operation.rendererId).filter((value): value is string => Boolean(value))));
  const missingRendererIds = [...rendererIds].filter((rendererId) => (
    !Object.hasOwn(agent.rendererBindings, rendererId)
    || typeof agent.rendererBindings[rendererId] !== 'string'
    || agent.rendererBindings[rendererId].length === 0
  )).sort();
  if (missingRendererIds.length > 0) {
    throw new Error(`Coding-agent profile ${agent.id} lacks renderer binding(s): ${missingRendererIds.join(', ')}`);
  }
  const rendererBindings = Object.fromEntries(
    [...rendererIds]
      .sort()
      .map((rendererId) => [rendererId, agent.rendererBindings[rendererId] as string]),
  );
  return {
    schemaVersion: 1,
    profileId: profile.id,
    agentProfile: agent.id,
    rendererBindings,
    contracts,
  };
}

export function resolveFieldContracts(input: ResolveFieldContractsInput): SelectedContract | null {
  return resolveFieldContractsInternal(input, false);
}

export function resolveProfileContracts(input: ResolveFieldContractsInput): SelectedContract {
  const selected = resolveFieldContractsInternal(input, true);
  if (!selected) throw new Error('A profile contract requires at least one field');
  return selected;
}

export function resolveOfficialDataProfile(profileId: string, adapter: string): OfficialDataProjection {
  const profile = getCanonicalProfile(profileId);
  return {
    adapter,
    schemaVersion: 1,
    profileId: profile.id,
    platform: profile.platform,
    product: profile.product,
    version: cloneValue(profile.version),
    surface: profile.surface,
    transport: profile.transport,
    extensibility: profile.extensibility,
    fields: profile.fields.map((field) => ({
      canonicalId: field.canonicalId,
      nativeToken: field.nativeToken,
      ...(field.displayName ? { displayName: field.displayName } : {}),
      valueShape: cloneValue(field.claims.valueShape.value),
      formats: field.formats.map(({ nativeToken, requires }) => ({
        nativeToken,
        ...(requires ? { requires: [...requires] } : {}),
      })),
    })),
  };
}
