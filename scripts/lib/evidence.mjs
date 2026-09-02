function uniqueMap(values, key, label) {
  const result = new Map();
  for (const value of values) {
    const id = value[key];
    if (result.has(id)) throw new Error(`${label} contains duplicate ${id}`);
    result.set(id, value);
  }
  return result;
}

export function buildEvidenceLocatorIndex(sourceManifest, locatorRegistry) {
  const officialSources = uniqueMap(sourceManifest.sources, 'id', 'Official sources');
  const locatorSources = uniqueMap(locatorRegistry.sources, 'sourceId', 'Evidence locator registry');
  for (const source of sourceManifest.sources) {
    const registered = locatorSources.get(source.id);
    if (!registered) throw new Error(`Evidence locator registry is missing ${source.id}`);
    const locators = uniqueMap(registered.locators, 'locator', `${source.id} locator registry`);
    if (!locators.has(source.locator)) throw new Error(`${source.id} locator registry is missing source locator ${JSON.stringify(source.locator)}`);
  }
  for (const sourceId of locatorSources.keys()) {
    if (!officialSources.has(sourceId)) throw new Error(`Evidence locator registry contains unknown source ${sourceId}`);
  }
  return { officialSources, locatorSources };
}

export function validateProfileEvidence({
  sourceProfile,
  profile,
  officialSources,
  locatorSources,
  definitions,
}) {
  const profileSourceIds = new Set(sourceProfile.sourceIds);
  const operationKinds = new Set(definitions.operationKinds);
  const authorities = new Set(definitions.authorities);
  const claimRefs = new Set(definitions.claimRefs);
  const formatStrategies = new Set(definitions.formatStrategies);
  const prohibitionCodes = new Set(definitions.prohibitionCodes);
  const selectionDiscriminators = new Map(Object.entries(definitions.selectionDiscriminators));

  function assertEvidence(evidence, label) {
    const source = officialSources.get(evidence.sourceId);
    if (!source) throw new Error(`${label}: unknown evidence source ${evidence.sourceId}`);
    if (!profileSourceIds.has(evidence.sourceId)) throw new Error(`${label}: evidence source ${evidence.sourceId} is outside profile ${profile.id}`);
    if (!source.profiles.includes(profile.id)) throw new Error(`${label}: official source ${evidence.sourceId} does not route profile ${profile.id}`);
    const locator = locatorSources.get(evidence.sourceId)?.locators.find((candidate) => candidate.locator === evidence.locator);
    if (!locator) throw new Error(`${label}: unreviewed locator ${evidence.sourceId} — ${evidence.locator}`);
    return locator;
  }

  assertEvidence(sourceProfile.defaultEvidence, `${profile.id}.defaultEvidence`);
  const sourceFields = new Map(sourceProfile.fields
    .filter((field) => typeof field !== 'string')
    .map((field) => [field.nativeToken, field]));
  for (const field of profile.fields) {
    const sourceField = sourceFields.get(field.nativeToken);
    for (const [claimName, claim] of Object.entries(field.claims)) {
      for (const evidence of claim.evidence) assertEvidence(evidence, `${field.canonicalId}.claims.${claimName}`);
      if (claimName !== 'nativeType' && claim.status === 'documented') {
        const authoredEvidence = sourceField?.claimEvidence?.[claimName] || [];
        if (authoredEvidence.length === 0) {
          throw new Error(`${field.canonicalId}.claims.${claimName}: documented claim lacks explicit authored claimEvidence`);
        }
        const authoredEvidenceKeys = new Set(authoredEvidence.map((evidence) => (
          `${evidence.sourceId}\0${evidence.locator}`
        )));
        for (const evidence of claim.evidence) {
          if (!authoredEvidenceKeys.has(`${evidence.sourceId}\0${evidence.locator}`)) {
            throw new Error(
              `${field.canonicalId}.claims.${claimName}: compiled evidence was not explicitly authored for this claim`,
            );
          }
        }
      }
    }
    for (const format of field.formats) {
      let exactEvidence = false;
      for (const evidence of format.evidence) {
        const locator = assertEvidence(evidence, `${field.canonicalId}.formats.${format.nativeToken}`);
        if (locator.tokens?.includes(format.nativeToken)) exactEvidence = true;
      }
      if (!exactEvidence) throw new Error(`${field.canonicalId}.formats.${format.nativeToken}: no reviewed locator contains the exact native format token`);
    }
    for (const operation of field.renderingOperations) {
      if (!operationKinds.has(operation.operation)) throw new Error(`${operation.id}: unknown rendering operation ${operation.operation}`);
      if (!authorities.has(operation.authority)) throw new Error(`${operation.id}: unknown rendering authority ${operation.authority}`);
      if (operation.formatStrategy && !formatStrategies.has(operation.formatStrategy)) throw new Error(`${operation.id}: unknown format strategy ${operation.formatStrategy}`);
      if (operation.selection) {
        const allowed = selectionDiscriminators.get(operation.selection.discriminator);
        if (!allowed) throw new Error(`${operation.id}: unknown rendering selection discriminator ${operation.selection.discriminator}`);
        if (!allowed.includes(operation.selection.equals)) throw new Error(`${operation.id}: unknown ${operation.selection.discriminator} value ${operation.selection.equals}`);
      }
      for (const code of operation.prohibitionCodes) {
        if (!prohibitionCodes.has(code)) throw new Error(`${operation.id}: unknown prohibition code ${code}`);
      }
      for (const evidence of operation.evidence || []) assertEvidence(evidence, operation.id);
      for (const claimRef of operation.claimRefs || []) {
        if (!claimRefs.has(claimRef)) throw new Error(`${operation.id}: unknown claim reference ${claimRef}`);
        const claimName = claimRef.slice('claims.'.length);
        const claim = field.claims[claimName];
        if (!claim || claim.status !== 'documented') throw new Error(`${operation.id}: claim reference ${claimRef} is not documented on ${field.canonicalId}`);
      }
      if (operation.authority === 'official') {
        if (!operation.evidence || operation.evidence.length === 0) throw new Error(`${operation.id}: official operation lacks evidence`);
        if (operation.claimRefs) throw new Error(`${operation.id}: official operation cannot claim contract-derived authority`);
      }
      if (operation.authority === 'contract-derived') {
        if (!operation.claimRefs || operation.claimRefs.length === 0) throw new Error(`${operation.id}: contract-derived operation lacks claimRefs`);
        if (operation.evidence) throw new Error(`${operation.id}: contract-derived operation cannot claim official evidence`);
      }
      if (operation.authority === 'consumer-policy') throw new Error(`${operation.id}: consumer policy cannot live in canonical source`);
    }
  }
}
