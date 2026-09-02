import definitionsJson from '../definitions/rendering-operations.json' with { type: 'json' };
import { cloneValue, deepFreeze } from './immutability.js';
import type { DeepReadonly } from './types.js';

export type RenderingOperationKind =
  | 'direct'
  | 'branch'
  | 'format'
  | 'component'
  | 'anchor'
  | 'asset'
  | 'resolved-content'
  | 'reference'
  | 'iterate'
  | 'pass-through';

export type RenderingAuthority = 'official' | 'contract-derived' | 'consumer-policy';

export type OfficialClaimRef =
  | 'claims.nativeType'
  | 'claims.valueShape'
  | 'claims.typicalUse'
  | 'claims.editorBehavior'
  | 'claims.storageShape'
  | 'claims.deliveryShape';

export type RenderingFormatStrategy = 'shared-util';

export type RenderingSelectionDiscriminator = 'content-reference-usage';

export type RenderingSelectionValue = 'link' | 'media';

export type ProhibitionCode =
  | 'apply-edit-attribute-per-item'
  | 'apply-preview-attributes-per-item'
  | 'apply-preview-attributes-to-richtext-renderer'
  | 'assume-binary-string-url'
  | 'assume-password-encrypted'
  | 'assume-undocumented-shape'
  | 'coerce-checkbox-with-generic-truthiness'
  | 'coerce-rich-text-to-html-string'
  | 'coerce-rich-text-to-plain-string'
  | 'construct-media-url-manually'
  | 'discard-editable-field-shape'
  | 'discard-field-metadata'
  | 'escape-rich-text-as-plain-text'
  | 'flatten-asset-reference'
  | 'flatten-content-reference'
  | 'flatten-file-field'
  | 'flatten-link-field'
  | 'flatten-link-object'
  | 'flatten-list'
  | 'flatten-resolved-content'
  | 'flatten-reference'
  | 'flatten-structured-value'
  | 'flatten-url-object'
  | 'invent-fallback-value'
  | 'omit-component-content-type'
  | 'pass-content-reference-to-optimizely-component'
  | 'pass-url-to-content-reference-resolver'
  | 'render-secret-value'
  | 'replace-sdk-field-with-raw-html'
  | 'replace-sdk-field-with-raw-value'
  | 'treat-html-source-as-richtext-type';

export interface RenderingOperationDefinitions {
  schemaVersion: 1;
  operationKinds: RenderingOperationKind[];
  authorities: RenderingAuthority[];
  claimRefs: OfficialClaimRef[];
  formatStrategies: RenderingFormatStrategy[];
  selectionDiscriminators: Record<RenderingSelectionDiscriminator, RenderingSelectionValue[]>;
  prohibitionCodes: ProhibitionCode[];
}

export const RENDERING_OPERATION_DEFINITIONS: DeepReadonly<RenderingOperationDefinitions> = deepFreeze(
  cloneValue(definitionsJson as RenderingOperationDefinitions),
);
export const RENDERING_OPERATION_KINDS = RENDERING_OPERATION_DEFINITIONS.operationKinds;
export const RENDERING_AUTHORITIES = RENDERING_OPERATION_DEFINITIONS.authorities;
export const OFFICIAL_CLAIM_REFS = RENDERING_OPERATION_DEFINITIONS.claimRefs;
export const RENDERING_FORMAT_STRATEGIES = RENDERING_OPERATION_DEFINITIONS.formatStrategies;
export const RENDERING_SELECTION_DISCRIMINATORS = RENDERING_OPERATION_DEFINITIONS.selectionDiscriminators;
export const PROHIBITION_CODES = RENDERING_OPERATION_DEFINITIONS.prohibitionCodes;
