export type Platform =
  | 'contentful'
  | 'contentstack'
  | 'optimizely-saas'
  | 'optimizely-paas'
  | 'sitecore-ai'
  | 'sitecore-on-prem'
  | 'wordpress';

import type {
  OfficialClaimRef,
  ProhibitionCode,
  RenderingAuthority,
  RenderingFormatStrategy,
  RenderingOperationKind,
  RenderingSelectionDiscriminator,
  RenderingSelectionValue,
} from './definitions.js';

export type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly unknown[]
    ? { readonly [Key in keyof T]: DeepReadonly<T[Key]> }
    : T extends object
      ? { readonly [Key in keyof T]: DeepReadonly<T[Key]> }
      : T;

export interface OfficialEvidence {
  sourceId: string;
  locator: string;
}

export interface OfficialClaim<T> {
  status: 'documented' | 'undocumented';
  value: T | null;
  evidence: OfficialEvidence[];
}

export type OfficialSourceRole =
  | 'enumeration'
  | 'editor'
  | 'management-schema'
  | 'storage'
  | 'delivery'
  | 'extension-boundary'
  | 'compatibility'
  | 'release-index'
  | 'sdk-source';

export type OfficialSourceVersionMode =
  | 'pinned-version'
  | 'pinned-git-tag'
  | 'pinned-git-commit'
  | 'rolling-saas'
  | 'rolling-documentation'
  | 'release-index';

export interface OfficialSource {
  id: string;
  vendor: string;
  title: string;
  url: string;
  allowedHosts: string[];
  profiles: string[];
  role: OfficialSourceRole;
  completeness: 'exhaustive' | 'supplemental';
  version: { mode: OfficialSourceVersionMode; value?: string };
  locator: string;
  extract: {
    kind: 'document' | 'heading' | 'list' | 'table' | 'json-pointer' | 'symbol' | 'repository-path';
    identityPattern?: string;
    identityFlags?: string;
    identityCapture?: number;
    tokens?: string[];
    tokenDiscovery?: {
      maximumTokens: number;
      regions: Array<{
        id: string;
        startPattern?: string;
        endPattern?: string;
        boundaryFlags?: string;
        itemPattern: string;
        itemFlags?: string;
        itemCapture: number;
      }>;
    };
  };
  reviewOwner: string;
  replacementHistory?: Array<{
    recordedAt: string;
    reason: string;
    replacedUrl?: string;
    replacementUrl?: string;
  }>;
}

export interface ValueShape {
  kind: 'string' | 'boolean' | 'integer' | 'number' | 'datetime' | 'object' | 'array' | 'reference' | 'rich-text' | 'binary' | 'unknown';
  nullable: boolean;
  valuePath?: string;
  itemKind?: string;
  members?: string[];
}

export interface RenderingCondition {
  path: string;
  equals: string;
  attributes: Record<string, string>;
}

export interface RenderingSelectionPredicate {
  discriminator: RenderingSelectionDiscriminator;
  equals: RenderingSelectionValue;
}

export interface RenderingSelectionInput {
  fieldId: string;
  discriminator: RenderingSelectionDiscriminator;
  value: RenderingSelectionValue;
}

export interface RenderingOperation {
  id: string;
  operation: RenderingOperationKind;
  authority: RenderingAuthority;
  valuePath?: string;
  rendererId?: string;
  props?: Record<string, string>;
  attributes?: Record<string, string>;
  editTarget?: 'self' | 'wrapper' | 'container' | 'none';
  stableKeyPaths?: string[];
  stableKeyFallback?: 'index-primitive-or-no-identity';
  selection?: RenderingSelectionPredicate;
  conditions?: RenderingCondition[];
  nullHandling?: 'preserve' | 'undefined-attribute' | 'branch' | 'not-applicable';
  formatStrategy?: RenderingFormatStrategy;
  constraintKeys?: string[];
  prohibitionCodes: ProhibitionCode[];
  evidence?: OfficialEvidence[];
  claimRefs?: OfficialClaimRef[];
  policyId?: string;
}

export interface FieldFormat {
  nativeToken: string;
  requires?: string[];
  evidence: OfficialEvidence[];
}

export interface FieldApplicability {
  profileId: string;
  product: string;
  version: { mode: 'pinned' | 'rolling'; label: string; sdk?: string };
  surface: 'authoring' | 'management' | 'storage' | 'delivery' | 'sdk';
  transport: string;
}

export interface FieldTypeFact {
  canonicalId: string;
  nativeToken: string;
  displayName?: string;
  origin: 'native';
  applicability: FieldApplicability;
  claims: {
    nativeType: OfficialClaim<string>;
    valueShape: OfficialClaim<ValueShape>;
    typicalUse: OfficialClaim<string>;
    editorBehavior: OfficialClaim<string>;
    storageShape: OfficialClaim<string>;
    deliveryShape: OfficialClaim<string>;
  };
  renderingOperations: RenderingOperation[];
  formats: FieldFormat[];
}

export interface CmsProfile {
  schemaVersion: 1;
  id: string;
  platform: Platform;
  product: string;
  version: { mode: 'pinned' | 'rolling'; label: string; sdk?: string };
  surface: 'authoring' | 'management' | 'storage' | 'delivery' | 'sdk';
  transport: string;
  extensibility: 'closed-at-profile' | 'discoverable' | 'open';
  notes?: string[];
  sourceIds: string[];
  fields: FieldTypeFact[];
}

export interface Catalog {
  schemaVersion: 1;
  catalogVersion: 1;
  sourceLockDigest: string;
  platforms: Platform[];
  profiles: CmsProfile[];
}

export interface AgentGuidanceProfile {
  schemaVersion: 1;
  id: string;
  framework: string;
  rendererBindings: Record<string, string>;
  rules: Array<{ fieldId: string; operations: RenderingOperation[] }>;
}

export interface ConsumerProfile {
  schemaVersion: 1;
  id: 'ai-orchestration' | 'cos' | 'generic';
  agentProfile?: string;
  outputMode: 'selected-contract' | 'official-data';
  includeProvenanceInAgentContext: false;
  adapters: Record<string, string>;
}

export interface ConsumerConfig {
  $schema: string;
  packageName: 'cms-field-vocabulary';
  profile: 'ai-orchestration' | 'cos' | 'generic';
  adapter: string;
  target: string;
}

export interface CompactRenderingOperation extends Omit<RenderingOperation, 'evidence' | 'claimRefs'> {}

export interface ResolvedFieldContract {
  canonicalId: string;
  nativeToken: string;
  valueShape: ValueShape | null;
  formats: Array<{ nativeToken: string; requires?: string[] }>;
  operations: CompactRenderingOperation[];
}

export interface SelectedContract {
  schemaVersion: 1;
  profileId: string;
  agentProfile: string;
  rendererBindings: Record<string, string>;
  contracts: ResolvedFieldContract[];
}

export interface CompactOfficialFieldData {
  canonicalId: string;
  nativeToken: string;
  displayName?: string;
  valueShape: ValueShape | null;
  formats: Array<{ nativeToken: string; requires?: string[] }>;
}

export interface OfficialDataProjection {
  adapter: string;
  schemaVersion: 1;
  profileId: string;
  platform: Platform;
  product: string;
  version: CmsProfile['version'];
  surface: CmsProfile['surface'];
  transport: string;
  extensibility: CmsProfile['extensibility'];
  fields: CompactOfficialFieldData[];
}

export interface ResolveFieldContractsInput {
  profileId: string;
  fieldIds: string[];
  agentProfile: string;
  renderingSelections?: RenderingSelectionInput[];
}

export interface ProjectionManifestFile {
  path: string;
  sha256: string;
  bytes: number;
}

export interface ProjectionManifest {
  schemaVersion: 1;
  generatedBy: 'cms-field-vocabulary';
  packageVersion: string;
  profile: string;
  adapter: string;
  projectionMode: ConsumerProfile['outputMode'];
  vocabularyProfile: string;
  catalogDigest: string;
  configDigest: string;
  files: ProjectionManifestFile[];
}

export interface FreshnessObservation {
  sourceId: string;
  classification: 'unchanged' | 'cosmetic' | 'claim-changing' | 'enumeration-changing' | 'version-changing' | 'unreachable' | 'removed';
  observedAt: string;
  rawSha256: string | null;
  normalizedSha256: string | null;
  fragmentSha256: string | null;
  requiredTokenSetSha256: string | null;
  requiredTokens: string[];
  observedTokenSetSha256: string | null;
  observedTokens: string[] | null;
  identities: string[];
  missingRequiredTokens: string[];
  missingObservedTokens: string[];
  enumerationExtractionError?: string;
}
