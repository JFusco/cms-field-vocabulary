import assert from 'node:assert/strict';
import test from 'node:test';
import Ajv2020 from 'ajv/dist/2020.js';
import { compileCatalog, compileSourceProfile } from '../scripts/lib/catalog.mjs';
import { buildEvidenceLocatorIndex, validateProfileEvidence } from '../scripts/lib/evidence.mjs';
import { loadRuntime, readJson } from './helpers.mjs';

async function evidenceFixture() {
  const [compiled, sourceManifest, locatorRegistry, definitions] = await Promise.all([
    compileCatalog(),
    readJson('sources/official-sources.json'),
    readJson('sources/evidence-locators.json'),
    readJson('definitions/rendering-operations.json'),
  ]);
  const indexes = buildEvidenceLocatorIndex(sourceManifest, locatorRegistry);
  const sourceProfiles = new Map(compiled.sourceProfiles.map((profile) => [profile.id, profile]));
  const profiles = new Map(compiled.profiles.map((profile) => [profile.id, profile]));
  return { ...indexes, definitions, sourceProfiles, profiles };
}

function validateProfile(fixture, profileId, profile = fixture.profiles.get(profileId)) {
  validateProfileEvidence({
    sourceProfile: fixture.sourceProfiles.get(profileId),
    profile,
    officialSources: fixture.officialSources,
    locatorSources: fixture.locatorSources,
    definitions: fixture.definitions,
  });
}

test('every compiled claim, format, and rendering operation uses reviewed profile-local evidence', async () => {
  const fixture = await evidenceFixture();
  for (const profileId of fixture.profiles.keys()) validateProfile(fixture, profileId);
});

test('every authored non-null semantic claim has explicit claim-level evidence', async () => {
  const fixture = await evidenceFixture();
  const claimNames = ['valueShape', 'typicalUse', 'editorBehavior', 'storageShape', 'deliveryShape'];
  for (const sourceProfile of fixture.sourceProfiles.values()) {
    const compiled = fixture.profiles.get(sourceProfile.id);
    const compiledFields = new Map(compiled.fields.map((field) => [field.nativeToken, field]));
    for (const field of sourceProfile.fields) {
      if (typeof field === 'string') continue;
      const compiledField = compiledFields.get(field.nativeToken);
      for (const claimName of claimNames) {
        if (field[claimName] === null || field[claimName] === undefined) continue;
        assert.ok(field.claimEvidence?.[claimName]?.length > 0, `${sourceProfile.id}.${field.nativeToken}.${claimName}`);
        assert.deepEqual(
          compiledField.claims[claimName].evidence,
          field.claimEvidence[claimName],
          `${sourceProfile.id}.${field.nativeToken}.${claimName}`,
        );
      }
    }
  }
});

test('compiler never promotes exact-token, field, or profile-default evidence into semantic claims', () => {
  const source = {
    id: 'fixture.official-types',
    locator: 'Exact token table',
    extract: { tokens: ['Example'] },
  };
  const profile = {
    schemaVersion: 1,
    id: 'fixture.profile',
    platform: 'contentful',
    product: 'Fixture',
    version: { mode: 'pinned', label: '1' },
    surface: 'management',
    transport: 'fixture',
    extensibility: 'closed-at-profile',
    sourceIds: [source.id],
    defaultEvidence: { sourceId: source.id, locator: 'Exact token table' },
    fields: [{
      nativeToken: 'Example',
      valueShape: null,
      typicalUse: 'Unsupported without an explicit claim citation.',
      editorBehavior: null,
      storageShape: null,
      deliveryShape: null,
      evidence: [{ sourceId: source.id, locator: 'Exact token table' }],
      renderingOperations: [],
    }],
  };

  assert.throws(
    () => compileSourceProfile(profile, [source]),
    /fixture\.profile\.Example\.typicalUse: authored claim requires explicit claimEvidence/,
  );
});

test('evidence validation rejects compiled semantic evidence not explicitly authored for that claim', async () => {
  const fixture = await evidenceFixture();
  const profileId = 'contentful.cma.saas';
  const profile = structuredClone(fixture.profiles.get(profileId));
  const symbol = profile.fields.find((field) => field.nativeToken === 'Symbol');
  symbol.claims.typicalUse.evidence.push({
    sourceId: 'contentful.cma.field-types',
    locator: 'Content type > createField(id[, opts]) > type',
  });
  assert.throws(
    () => validateProfile(fixture, profileId, profile),
    /compiled evidence was not explicitly authored for this claim/,
  );
});

test('evidence validation rejects unreviewed locators and cross-profile citations', async () => {
  const fixture = await evidenceFixture();
  const profileId = 'contentful.cma.saas';
  const unreviewed = structuredClone(fixture.profiles.get(profileId));
  unreviewed.fields[0].claims.typicalUse.evidence[0].locator = 'Invented locator';
  assert.throws(() => validateProfile(fixture, profileId, unreviewed), /unreviewed locator/);

  const crossProfile = structuredClone(fixture.profiles.get(profileId));
  crossProfile.fields[0].claims.typicalUse.evidence[0] = {
    sourceId: 'wordpress.register-meta',
    locator: 'Parameters > args > type > valid values',
  };
  assert.throws(() => validateProfile(fixture, profileId, crossProfile), /outside profile contentful\.cma\.saas/);
});

test('format evidence must name a reviewed locator containing the exact native format token', async () => {
  const fixture = await evidenceFixture();
  const profileId = 'optimizely-saas.sdk-2';
  const profile = structuredClone(fixture.profiles.get(profileId));
  const string = profile.fields.find((field) => field.nativeToken === 'string');
  string.formats[0].nativeToken = 'inventedFormat';
  assert.throws(() => validateProfile(fixture, profileId, profile), /no reviewed locator contains the exact native format token/);
});

test('rendering operations reject unknown prohibition codes and claim references', async () => {
  const fixture = await evidenceFixture();
  const profileId = 'optimizely-saas.sdk-2';
  const unknownCode = structuredClone(fixture.profiles.get(profileId));
  const richText = unknownCode.fields.find((field) => field.nativeToken === 'richText');
  richText.renderingOperations[0].prohibitionCodes.push('invented-prohibition');
  assert.throws(() => validateProfile(fixture, profileId, unknownCode), /unknown prohibition code invented-prohibition/);

  const unknownClaim = structuredClone(fixture.profiles.get(profileId));
  const operation = unknownClaim.fields.find((field) => field.nativeToken === 'richText').renderingOperations[0];
  operation.claimRefs = ['claims.doesNotExist'];
  assert.throws(() => validateProfile(fixture, profileId, unknownClaim), /unknown claim reference claims\.doesNotExist/);
});

test('rendering authority channels stay mutually exclusive', async () => {
  const fixture = await evidenceFixture();

  const officialProfileId = 'sitecore-ai.content-sdk2';
  const officialAsDerived = structuredClone(fixture.profiles.get(officialProfileId));
  const richText = officialAsDerived.fields.find((field) => field.nativeToken === 'Rich Text');
  richText.renderingOperations[0].claimRefs = ['claims.valueShape'];
  assert.throws(
    () => validateProfile(fixture, officialProfileId, officialAsDerived),
    /official operation cannot claim contract-derived authority/,
  );

  const profileId = 'optimizely-saas.sdk-2';
  const derivedAsOfficial = structuredClone(fixture.profiles.get(profileId));
  const integer = derivedAsOfficial.fields.find((field) => field.nativeToken === 'integer');
  integer.renderingOperations[0].evidence = [
    {
      sourceId: 'optimizely-saas.sdk-modelling',
      locator: 'Modelling > Property Configuration > Property Types',
    },
  ];
  assert.throws(
    () => validateProfile(fixture, profileId, derivedAsOfficial),
    /contract-derived operation cannot claim official evidence/,
  );
});

test('rendering schemas expose the exact closed definition vocabulary', async () => {
  const definitions = await readJson('definitions/rendering-operations.json');
  for (const relative of ['schemas/source-profile.schema.json', 'schemas/profile.schema.json']) {
    const schema = await readJson(relative);
    const operation = schema.$defs.renderingOperation.properties;
    assert.deepEqual(operation.operation.enum, definitions.operationKinds, relative);
    assert.deepEqual(operation.authority.enum, definitions.authorities.filter((authority) => (
      relative.includes('source-profile') ? authority !== 'consumer-policy' : true
    )), relative);
    assert.deepEqual(operation.formatStrategy.enum, definitions.formatStrategies, relative);
    assert.deepEqual(operation.claimRefs.items.enum, definitions.claimRefs, relative);
    assert.deepEqual(operation.prohibitionCodes.items.enum, definitions.prohibitionCodes, relative);
    assert.deepEqual(
      Object.fromEntries(schema.$defs.renderingSelection.oneOf.map((selection) => [
        selection.properties.discriminator.const,
        selection.properties.equals.enum,
      ])),
      definitions.selectionDiscriminators,
      relative,
    );
  }
});

test('selected-contract schema accepts compact output and rejects provenance fields', async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true, validateFormats: false });
  const profileSchema = await readJson('schemas/profile.schema.json');
  const selectedSchema = await readJson('schemas/selected-contract.schema.json');
  ajv.addSchema(profileSchema);
  ajv.addSchema(selectedSchema);
  const validate = ajv.getSchema(selectedSchema.$id);
  const { resolveFieldContracts } = await loadRuntime();
  const selected = resolveFieldContracts({
    profileId: 'optimizely-saas.sdk-2',
    fieldIds: ['optimizely-saas.sdk-2.richText'],
    agentProfile: 'react-nextjs',
  });
  assert.equal(validate(selected), true, JSON.stringify(validate.errors));
  const leaked = structuredClone(selected);
  leaked.contracts[0].operations[0].evidence = [{ sourceId: 'source', locator: 'locator' }];
  assert.equal(validate(leaked), false);
});
